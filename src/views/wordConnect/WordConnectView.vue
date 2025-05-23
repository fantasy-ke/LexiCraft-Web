<template>
  <div class="connect-container">
    <header-component />
    
    <div class="content">
      <div class="connect-header">
        <div class="header-left">
          <a-select 
            :value ="wordCount" 
            style="width: 200px" 
            @change="handleCountChange"
          >
            <a-select-option :value="5">5 组单词</a-select-option>
            <a-select-option :value="10">10 组单词</a-select-option>
            <a-select-option :value="15">15 组单词</a-select-option>
            <a-select-option :value="20">20 组单词</a-select-option>
          </a-select>
          <a-button @click="resetGame" class="action-button">
          <template #icon><reload-outlined /></template>
          重新开始
        </a-button>
          
        </div>
        <a-button type="primary" @click="nextRound" class="action-button">
            <template #icon><forward-outlined /></template>
            下一轮
          </a-button>
        
      </div>
      
      <div class="connect-game" ref="gameContainer">
        <div class="word-columns">
          <div class="word-column word-column-left">
            <div 
              v-for="(word, index) in shuffledWords" 
              :key="'word-' + index"
              class="word-item"
              :class="{ 
                'selected': selectedWordIndex === index,
                'connected': connectedWords.includes(index)
              }"
              @click="selectWord(index)"
            >
              {{ word.word }}
            </div>
          </div>
          
          <div class="connect-lines">
            <svg width="100%" height="100%" ref="linesContainer">
              <line
                v-for="(line, index) in connections"
                :key="'line-' + index"
                :x1="line.x1"
                :y1="line.y1"
                :x2="line.x2"
                :y2="line.y2"
                :class="{ 'correct-line': line.correct, 'incorrect-line': !line.correct }"
                stroke-width="2"
              />
            </svg>
          </div>
          
          <div class="word-column word-column-right">
            <div 
              v-for="(translation, index) in shuffledTranslations" 
              :key="'translation-' + index"
              class="translation-item"
              :class="{ 
                'selected': selectedTranslationIndex === index,
                'connected': connectedTranslations.includes(index)
              }"
              @click="selectTranslation(index)"
            >
              {{ translation.translation }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="connect-status">
        <div class="connect-progress">
          <a-progress 
            :percent="progressPercent" 
            :format="() => `${correctPairs}/${totalPairs}`"
            status="active"
          />
        </div>
        
        <div class="connect-stats">
          <div class="stat-item">
            <span class="stat-label">正确配对：</span>
            <span class="stat-value">{{ correctPairs }}/{{ totalPairs }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">用时：</span>
            <span class="stat-value">{{ formatTime(gameTime) }}</span>
          </div>
        </div>
      </div>
      
      <div class="connect-pairs">
        <div 
          v-for="(pair, index) in matchedPairs" 
          :key="'pair-' + index"
          class="pair-item"
        >
          <span class="pair-word">{{ pair.word }}</span>
          <span class="pair-divider"> — </span>
          <span class="pair-translation">{{ pair.translation }}</span>
        </div>
      </div>
    </div>
    
    <footer-component study-mode="connect" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted, watchEffect } from 'vue';
import { message } from 'ant-design-vue';
import { ReloadOutlined, ForwardOutlined } from '@ant-design/icons-vue';
import { useWordStudyStore, type Word, WORD_LIST_CHANGED_EVENT, type WordList } from '@/store/wordStudy';
import { useUserStore } from '@/store/user';
import { fetchWordLists } from '@/api/wordlist';
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import FooterComponent from '@/components/common/FooterComponent.vue';

interface Connection {
  wordIndex: number;
  translationIndex: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  correct: boolean;
}

interface MatchedPair {
  word: string;
  translation: string;
}

// 游戏容器引用
const gameContainer = ref<HTMLElement | null>(null);
const linesContainer = ref<SVGElement | null>(null);

// 游戏设置
const wordCount = ref(5);
const wordStudyStore = useWordStudyStore();
const userStore = useUserStore();
const learnedWordIds = ref<string[]>([]);

// 游戏状态
const shuffledWords = ref<Word[]>([]);
const shuffledTranslations = ref<Word[]>([]);
const selectedWordIndex = ref<number | null>(null);
const selectedTranslationIndex = ref<number | null>(null);
const connections = ref<Connection[]>([]);
const connectedWords = ref<number[]>([]);
const connectedTranslations = ref<number[]>([]);
const matchedPairs = ref<MatchedPair[]>([]);
const correctPairs = ref(0);
const totalPairs = ref(0);
const gameTime = ref(0);
const gameTimer = ref<number | null>(null);
const gameStartTime = ref(0);
const correctConnections = ref<Connection[]>([]);

// 进度百分比
const progressPercent = computed(() => {
  if (totalPairs.value === 0) return 0;
  return Math.round((correctPairs.value / totalPairs.value) * 100);
});

// 处理连接数量变化
const handleCountChange = (value: number) => {
  console.log('切换单词数量:', value);
  wordCount.value = value;
  resetGame();
};

// 格式化时间
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 选择单词
const selectWord = (index: number) => {
  // 如果已经连接，不能选择
  if (connectedWords.value.includes(index)) return;
  
  selectedWordIndex.value = index;
  
  // 如果已选择了翻译，尝试连接
  if (selectedTranslationIndex.value !== null) {
    tryConnect();
  }
};

// 选择翻译
const selectTranslation = (index: number) => {
  // 如果已经连接，不能选择
  if (connectedTranslations.value.includes(index)) return;
  
  selectedTranslationIndex.value = index;
  
  // 如果已选择了单词，尝试连接
  if (selectedWordIndex.value !== null) {
    tryConnect();
  }
};

// 尝试连接单词和翻译
const tryConnect = () => {
  if (selectedWordIndex.value === null || selectedTranslationIndex.value === null) return;
  
  const wordIndex = selectedWordIndex.value;
  const translationIndex = selectedTranslationIndex.value;
  
  // 计算连接线的坐标
  const wordElements = document.querySelectorAll('.word-column-left .word-item');
  const translationElements = document.querySelectorAll('.word-column-right .translation-item');
  
  if (wordElements[wordIndex] && translationElements[translationIndex]) {
    const wordRect = wordElements[wordIndex].getBoundingClientRect();
    const translationRect = translationElements[translationIndex].getBoundingClientRect();
    const containerRect = gameContainer.value!.getBoundingClientRect();
    
    // 计算连接线在容器中的相对位置
    const x1 = wordRect.right - containerRect.left;
    const y1 = wordRect.top + wordRect.height / 2 - containerRect.top;
    const x2 = translationRect.left - containerRect.left;
    const y2 = translationRect.top + translationRect.height / 2 - containerRect.top;
    
    // 检查连接是否正确
    const isCorrect = shuffledWords.value[wordIndex].id === shuffledTranslations.value[translationIndex].id;
    
    // 添加连接
    connections.value.push({
      wordIndex,
      translationIndex,
      x1,
      y1,
      x2,
      y2,
      correct: isCorrect
    });
    
    if (isCorrect) {
      // 正确连接
      connectedWords.value.push(wordIndex);
      connectedTranslations.value.push(translationIndex);
      correctPairs.value++;
      
      // 添加到匹配对
      matchedPairs.value.push({
        word: shuffledWords.value[wordIndex].word,
        translation: shuffledTranslations.value[translationIndex].translation
      });
      
      // 标记单词为已掌握
      wordStudyStore.markWordAsMastered(shuffledWords.value[wordIndex].id, 'connect');
      
      // 更新进度
      updateProgress();
      
      // 检查游戏是否完成
      if (correctPairs.value === totalPairs.value) {
        gameOver();
      }
    } else {
      // 错误连接，短暂显示后移除
      setTimeout(() => {
        connections.value = connections.value.filter(
          conn => !(conn.wordIndex === wordIndex && conn.translationIndex === translationIndex)
        );
      }, 1000);
    }
    
    // 重置选择
    selectedWordIndex.value = null;
    selectedTranslationIndex.value = null;
  }
};

// 计算分数和更新学习进度
const updateProgress = () => {
  const totalTime = Math.round((Date.now() - gameStartTime.value) / 1000);
  
  const accuracy = correctPairs.value === 0 ? 0 : 
    Math.round((correctPairs.value / totalPairs.value) * 100);
  
  // 只有登录用户才会记录掌握单词
  const masteredCount = userStore.isLoggedIn ? 
    correctPairs.value : 
    wordStudyStore.getConnectProgress.masteredWords;
  
  // 更新连连看进度
  wordStudyStore.updateConnectProgress({
    totalWords: totalPairs.value,
    masteredWords: masteredCount,
    accuracy,
    studyTime: wordStudyStore.getConnectProgress.studyTime + totalTime
  });
};

// 游戏结束
const gameOver = () => {
  if (gameTimer.value) {
    clearInterval(gameTimer.value);
    gameTimer.value = null;
  }
  
  const allCompleted = connectedWords.value.length === shuffledWords.value.length;
  
  if (allCompleted) {
    message.success('恭喜！您已完成本轮连连看');
    
    // 记录正确连接的单词为已掌握（仅登录用户）
    if (userStore.isLoggedIn) {
      correctConnections.value.forEach(conn => {
        const wordId = shuffledWords.value[conn.wordIndex].id;
        wordStudyStore.markWordAsMastered(wordId, 'connect');
      });
    }
  }
  
  // 更新进度
  updateProgress();
};

// 下一轮，不显示已学习过的单词
const nextRound = async () => {
  // 保存当前已连接的单词ID
  const newLearnedIds = [...learnedWordIds.value];
  connectedWords.value.forEach(index => {
    const wordId = shuffledWords.value[index].id;
    if (!newLearnedIds.includes(wordId)) {
      newLearnedIds.push(wordId);
    }
  });
  learnedWordIds.value = newLearnedIds;
  
  // 重置游戏状态但保留学习记录
  await loadNewWords(true);
};

// 重置游戏，可以重新学习所有单词
const resetGame = async () => {
  // 重置所有状态，包括学习记录
  learnedWordIds.value = [];
  await loadNewWords(false);
};

// 加载新单词
const loadNewWords = async (excludeLearned: boolean) => {
  // 重置状态
  selectedWordIndex.value = null;
  selectedTranslationIndex.value = null;
  connections.value = [];
  connectedWords.value = [];
  connectedTranslations.value = [];
  matchedPairs.value = [];
  correctPairs.value = 0;
  gameTime.value = 0;
  
  if (gameTimer.value) {
    clearInterval(gameTimer.value);
  }
  
  // 开始计时
  gameStartTime.value = Date.now();
  gameTimer.value = window.setInterval(() => {
    gameTime.value++;
  }, 1000);
  
  // 获取词库
  if (!wordStudyStore.getCurrentWordList) {
    try {
      const wordLists = await fetchWordLists();
      wordStudyStore.updateWordList(wordLists);
      
      if (wordLists.length > 0) {
        wordStudyStore.setCurrentWordList(wordLists[0]);
      }
    } catch (error) {
      message.error('获取词库失败，请重试');
      return;
    }
  }
  
  if (wordStudyStore.getCurrentWordList) {
    // 获取词库单词
    let availableWords = [...wordStudyStore.getCurrentWordList.words];
    
    // 过滤掉已学习的单词
    if (excludeLearned && learnedWordIds.value.length > 0) {
      availableWords = availableWords.filter(word => !learnedWordIds.value.includes(word.id));
      
      if (availableWords.length === 0) {
        message.success('恭喜！您已学习完所有单词');
        learnedWordIds.value = []; // 重置已学习记录
        availableWords = [...wordStudyStore.getCurrentWordList.words]; // 重新加载所有单词
      }
    }
    
    // 根据设置的数量限制单词数
    if (availableWords.length > wordCount.value) {
      availableWords = availableWords.slice(0, wordCount.value);
    } else {
      // 如果词库单词不足，提示用户
      if (availableWords.length < wordCount.value) {
        message.info(`当前词库只有 ${availableWords.length} 组单词可用`);
      }
    }
    
    totalPairs.value = availableWords.length;
    
    // 打乱单词顺序
    shuffledWords.value = [...availableWords].sort(() => Math.random() - 0.5);
    shuffledTranslations.value = [...availableWords].sort(() => Math.random() - 0.5);
    
    // 更新进度
    wordStudyStore.updateConnectProgress({
      totalWords: totalPairs.value,
      masteredWords: 0,
      accuracy: 100,
      studyTime: 0
    });
  }
};

// 初始化游戏
const initGame = () => {
  resetGame();
  
  // 监听词库变更事件
  wordStudyStore.addEventListener(WORD_LIST_CHANGED_EVENT, handleWordListChanged);
};

// 处理词库变更
const handleWordListChanged = (newWordList: any) => {
  message.info(`词库已切换到: ${newWordList.name}`);
  resetGame();
};

onMounted(() => {
  initGame();
});

onUnmounted(() => {
  if (gameTimer.value) {
    clearInterval(gameTimer.value);
  }
  
  // 移除事件监听
  wordStudyStore.removeEventListener(WORD_LIST_CHANGED_EVENT, handleWordListChanged);
});
</script>

<style lang="scss" scoped>
@use '@/styles/views/WordConnectView.scss';
</style> 