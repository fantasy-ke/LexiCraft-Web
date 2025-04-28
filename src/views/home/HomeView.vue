<template>
  <div class="home-container">
    <header-component />
    
    <div class="content">
      <div class="word-study-container">
        <div class="word-settings">
          <a-button-group>
            <a-button 
              type="text" 
              :class="{ active: settings.playPronunciation }"
              @click="toggleSetting('playPronunciation')"
            >
              <template #icon><sound-outlined /></template>
              自动发音
            </a-button>
            <a-button 
              type="text" 
              :class="{ active: settings.showPhonetic }"
              @click="toggleSetting('showPhonetic')"
            >
              <template #icon><read-outlined /></template>
              显示音标
            </a-button>
            <a-button 
              type="text" 
              :class="{ active: settings.showTranslation }"
              @click="toggleSetting('showTranslation')"
            >
              <template #icon><translation-outlined /></template>
              显示释义
            </a-button>
          </a-button-group>
        </div>

        <div class="word-display" v-if="currentWord">
          <div class="word-content">
            <h2 class="word-text">{{ currentWord.word }}</h2>
            <div class="pronunciation-container">
              <template v-if="settings.showPhonetic">
                <div class="word-phonetic">{{ currentWord.pronunciation }}</div>
                <div class="sound-button" @click="playPronunciation">
                  <sound-outlined />
                </div>
              </template>
              <div v-else class="sound-button-solo" @click="playPronunciation">
                <sound-outlined />
              </div>
            </div>
            <p class="word-translation" v-if="settings.showTranslation">{{ currentWord.translation }}</p>
          </div>
        </div>

        <div class="word-input-wrapper" v-if="currentWord">
          <word-input 
            :word="currentWord.word" 
            ref="wordInputRef"
            @correct="handleCorrectLetter"
            @incorrect="handleIncorrectLetter"
            @complete="handleWordComplete"
          />
        </div>

        <div class="word-example" v-if="currentWord && settings.showTranslation">
          <a-typography-paragraph>
            <strong>例句：</strong>{{ currentWord.example }}
          </a-typography-paragraph>
          <a-typography-paragraph v-if="currentWord.exampleTranslation" class="example-translation">
            <strong>翻译：</strong>{{ currentWord.exampleTranslation }}
          </a-typography-paragraph>
        </div>

        <div class="word-navigation">
          <a-button type="primary" @click="prevWord" :disabled="currentWordIndex <= 0">
            <template #icon><left-outlined /></template>
            上一个
          </a-button>
          <a-button type="primary" @click="nextWord" :disabled="currentWordIndex >= wordList.length - 1">
            <template #icon><right-outlined /></template>
            下一个
          </a-button>
        </div>
      </div>
    </div>
    
    <footer-component study-mode="spelling" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { SoundOutlined, ReadOutlined, TranslationOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { useWordStudyStore, type Word, WORD_LIST_CHANGED_EVENT } from '@/store/wordStudy';
import { fetchWordLists, getWordPronunciation } from '@/api/wordlist';
import HeaderComponent from '@/components/common/HeaderComponent.vue';
import FooterComponent from '@/components/common/FooterComponent.vue';
import WordInput from '@/components/common/WordInput.vue';

const wordStudyStore = useWordStudyStore();
const wordInputRef = ref<InstanceType<typeof WordInput> | null>(null);

// 音频元素
const audioElement = ref<HTMLAudioElement>(new Audio());

// 当前单词索引
const currentWordIndex = ref(0);

// 当前词库中的单词列表
const wordList = ref<Word[]>([]);

// 错误计数
const errorCount = ref(0);
const startTime = ref(Date.now());
const studyTime = ref(0);

// 学习设置
const settings = computed(() => wordStudyStore.getSettings);

// 当前单词
const currentWord = computed(() => {
  if (wordList.value.length === 0 || currentWordIndex.value >= wordList.value.length) {
    return null;
  }
  return wordList.value[currentWordIndex.value];
});

// 切换设置
const toggleSetting = (key: 'showPhonetic' | 'showTranslation' | 'playPronunciation') => {
  wordStudyStore.updateSettings({ [key]: !settings.value[key] });
  
  // 如果切换自动发音设置为开启，则播放当前单词发音
  if (key === 'playPronunciation' && settings.value.playPronunciation && currentWord.value) {
    playPronunciation();
  }
};

// 播放单词发音
const playPronunciation = () => {
  if (currentWord.value) {
    const wordAudio = getWordPronunciation(currentWord.value.word);
    audioElement.value.src = wordAudio;
    audioElement.value.play();
  }
};

// 前往上一个单词
const prevWord = () => {
  if (currentWordIndex.value > 0) {
    currentWordIndex.value--;
    nextTick(() => {
      (wordInputRef.value as any)?.resetInput();
      if (settings.value.playPronunciation) {
        setTimeout(playPronunciation, 300);
      }
    });
  }
};

// 前往下一个单词
const nextWord = () => {
  if (currentWordIndex.value < wordList.value.length - 1) {
    currentWordIndex.value++;
    nextTick(() => {
      (wordInputRef.value as any)?.resetInput();
      if (settings.value.playPronunciation) {
        setTimeout(playPronunciation, 300);
      }
    });
  }
};

// 处理字母输入正确
const handleCorrectLetter = (index: number) => {
  // 可以在这里添加正确输入的效果或统计
};

// 处理字母输入错误
const handleIncorrectLetter = (index: number) => {
  errorCount.value++;
};

// 处理单词完成
const handleWordComplete = async (word: string) => {
  if (currentWord.value) {
    // 标记单词为已掌握
    wordStudyStore.markWordAsMastered(currentWord.value.id, 'spelling');
    
    // 更新统计数据
    const totalWords = wordList.value.length;
    const masteredWords = wordStudyStore.getSpellingProgress.masteredWords;
    const endTime = Date.now();
    studyTime.value += Math.floor((endTime - startTime.value) / 1000);
    
    // 计算正确率
    const totalTyped = word.length + errorCount.value;
    const accuracy = Math.round((word.length / totalTyped) * 100);
    
    // 更新进度
    wordStudyStore.updateSpellingProgress({
      totalWords,
      masteredWords,
      accuracy,
      studyTime: studyTime.value
    });
    
    // 提示完成
    message.success('恭喜你拼写正确！');
    
    // 自动进入下一个单词
    if (currentWordIndex.value < wordList.value.length - 1) {
      setTimeout(() => {
        nextWord();
      }, 800);
    } else {
      message.info('恭喜你已完成当前词库的学习！');
    }
    
    // 重置错误计数和开始时间
    errorCount.value = 0;
    startTime.value = Date.now();
  }
};

// 加载单词列表
const loadWordList = async () => {
  // 重置数据
  currentWordIndex.value = 0;
  errorCount.value = 0;
  startTime.value = Date.now();
  
  // 获取当前词库
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
    wordList.value = [...wordStudyStore.getCurrentWordList.words];
    
    // 自动播放第一个单词发音
    nextTick(() => {
      if (settings.value.playPronunciation && currentWord.value) {
        setTimeout(playPronunciation, 300);
      }
    });
  }
};

// 处理词库变更
const handleWordListChanged = (newWordList: any) => {
  if (newWordList && newWordList.name) {
    message.info(`词库已切换到: ${newWordList.name}`);
    loadWordList();
  }
};

// 初始化
onMounted(async () => {
  try {
    await loadWordList();
    
    // 监听词库变更事件
    wordStudyStore.addEventListener(WORD_LIST_CHANGED_EVENT, handleWordListChanged);
  } catch (error) {
    console.error("初始化失败:", error);
  }
});

// 清理
onUnmounted(() => {
  try {
    // 移除事件监听
    wordStudyStore.removeEventListener(WORD_LIST_CHANGED_EVENT, handleWordListChanged);
  } catch (error) {
    console.error("清理失败:", error);
  }
});
</script>

<style lang="scss" scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  .content {
    min-height: calc(100vh - 280px);
    
    .word-study-container {
      background-color: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 600px;
      
      .word-settings {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 24px;
        
        .ant-btn-group {
          display: flex;
          align-items: center;
        }
        
        .ant-btn {
          padding: 8px 16px;
          display: flex;
          align-items: center;
          height: auto;
          
          .anticon {
            margin-right: 6px;
            font-size: 16px;
            display: flex;
            align-items: center;
          }
          
          &.active {
            color: #1890ff;
            background-color: #e6f7ff;
          }
        }
      }
      
      .word-display {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
        
        .word-content {
          text-align: center;
          
          .word-text {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #262626;
          }
          
          .pronunciation-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            min-height: 24px;
            
            .word-phonetic {
              font-size: 16px;
              color: #8c8c8c;
              margin-right: 10px;
            }
            
            .sound-button, .sound-button-solo {
              font-size: 18px;
              color: #1890ff;
              cursor: pointer;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              transition: all 0.3s;
              
              .anticon {
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              &:hover {
                background-color: #e6f7ff;
                transform: scale(1.1);
              }
            }
            
            .sound-button-solo {
              margin: 0 auto;
            }
          }
          
          .word-translation {
            font-size: 18px;
            color: #595959;
          }
        }
      }
      
      .word-input-wrapper {
        margin-bottom: 24px;
      }
      
      .word-example {
        max-width: 600px;
        margin: 0 auto 24px;
        padding: 16px;
        background-color: #f5f5f5;
        border-radius: 8px;
        color: #595959;
        
        .example-translation {
          font-style: italic;
          color: #8c8c8c;
          margin-top: 8px;
        }
      }
      
      .word-navigation {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-top: 32px;
        
        .ant-btn {
          display: flex;
          align-items: center;
          
          .anticon {
            font-size: 16px;
            display: flex;
            align-items: center;
          }
        }
      }
    }
  }
}
</style> 