import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 定义事件名称常量
export const WORD_LIST_CHANGED_EVENT = 'word-list-changed';

export interface Word {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string;
  example?: string;
  exampleTranslation?: string;
  mastered?: boolean;
  lastStudied?: number;
}

export interface WordList {
  id: string;
  name: string;
  description?: string;
  words: Word[];
}

export interface StudyProgress {
  totalWords: number;
  masteredWords: number;
  accuracy: number;
  studyTime: number;
}

export interface StudySettings {
  showTranslation: boolean;
  playPronunciation: boolean;
  showPhonetic: boolean;
}

interface EventListeners {
  [key: string]: Function[];
}

export const useWordStudyStore = defineStore('wordStudy', () => {
  // 状态
  const wordLists = ref<WordList[]>([]);
  const currentWordList = ref<WordList | null>(null);
  const settings = ref<StudySettings>({
    showTranslation: true,
    playPronunciation: true,
    showPhonetic: true
  });
  const spellingProgress = ref<StudyProgress>({
    totalWords: 0,
    masteredWords: 0,
    accuracy: 0,
    studyTime: 0
  });
  const connectProgress = ref<StudyProgress>({
    totalWords: 0,
    masteredWords: 0,
    accuracy: 0,
    studyTime: 0
  });
  
  // 事件监听器
  const listeners = ref<EventListeners>({
    [WORD_LIST_CHANGED_EVENT]: []
  });

  // Getters
  const getWordLists = computed(() => wordLists.value);
  const getCurrentWordList = computed(() => currentWordList.value);
  const getSettings = computed(() => settings.value);
  const getSpellingProgress = computed(() => spellingProgress.value);
  const getConnectProgress = computed(() => connectProgress.value);

  // 更新词库列表
  function updateWordList(lists: WordList[]) {
    wordLists.value = lists;
  }

  // 设置当前词库
  function setCurrentWordList(list: WordList) {
    currentWordList.value = list;
    // 触发词库变更事件
    notifyListeners(WORD_LIST_CHANGED_EVENT, list);
  }

  // 标记单词为已掌握
  function markWordAsMastered(wordId: string, mode: 'spelling' | 'connect') {
    if (!currentWordList.value) return;
    
    const word = currentWordList.value.words.find(w => w.id === wordId);
    if (word) {
      word.mastered = true;
      word.lastStudied = Date.now();
    }
    
    if (mode === 'spelling') {
      spellingProgress.value.masteredWords++;
    } else if (mode === 'connect') {
      connectProgress.value.masteredWords++;
    }
  }

  // 更新拼写学习进度
  function updateSpellingProgress(progress: Partial<StudyProgress>) {
    spellingProgress.value = { ...spellingProgress.value, ...progress };
  }

  // 更新连连看学习进度
  function updateConnectProgress(progress: Partial<StudyProgress>) {
    connectProgress.value = { ...connectProgress.value, ...progress };
  }
  
  // 更新设置
  function updateSettings(newSettings: Partial<StudySettings>) {
    settings.value = { ...settings.value, ...newSettings };
  }
  
  // 添加事件监听器
  function addEventListener(event: string, callback: Function) {
    if (!listeners.value[event]) {
      listeners.value[event] = [];
    }
    listeners.value[event].push(callback);
  }
  
  // 移除事件监听器
  function removeEventListener(event: string, callback: Function) {
    if (listeners.value[event]) {
      listeners.value[event] = listeners.value[event].filter(cb => cb !== callback);
    }
  }
  
  // 通知所有监听器
  function notifyListeners(event: string, data: any) {
    if (listeners.value[event]) {
      listeners.value[event].forEach(callback => callback(data));
    }
  }

  return {
    // 状态
    wordLists,
    currentWordList,
    settings,
    spellingProgress,
    connectProgress,
    
    // Getters
    getWordLists,
    getCurrentWordList,
    getSettings,
    getSpellingProgress,
    getConnectProgress,
    
    // Actions
    updateWordList,
    setCurrentWordList,
    markWordAsMastered,
    updateSpellingProgress,
    updateConnectProgress,
    updateSettings,
    
    // 事件相关
    addEventListener,
    removeEventListener
  };
}); 