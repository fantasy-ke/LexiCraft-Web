import { defineStore } from 'pinia';

export interface Word {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  example: string;
  mastered: boolean;
}

export interface WordList {
  id: string;
  name: string;
  description: string;
  count: number;
  words: Word[];
}

export const useWordStudyStore = defineStore('wordStudy', {
  state: () => ({
    currentWordList: null as WordList | null,
    wordLists: [] as WordList[],
    progress: {
      typing: {
        totalWords: 0,
        masteredWords: 0,
        accuracy: 100,
        studyTime: 0
      },
      connect: {
        totalWords: 0,
        masteredWords: 0,
        accuracy: 100,
        studyTime: 0
      }
    },
    settings: {
      showPhonetic: true,
      showTranslation: true,
      playPronunciation: true
    }
  }),

  getters: {
    getCurrentWordList: (state) => state.currentWordList,
    getWordLists: (state) => state.wordLists,
    getTypingProgress: (state) => state.progress.typing,
    getConnectProgress: (state) => state.progress.connect,
    getSettings: (state) => state.settings
  },

  actions: {
    setCurrentWordList(wordList: WordList) {
      this.currentWordList = wordList;
    },

    addWordList(wordList: WordList) {
      this.wordLists.push(wordList);
    },

    updateWordList(wordLists: WordList[]) {
      this.wordLists = wordLists;
    },

    updateTypingProgress(progress: { totalWords?: number, masteredWords?: number, accuracy?: number, studyTime?: number }) {
      this.progress.typing = { ...this.progress.typing, ...progress };
    },

    updateConnectProgress(progress: { totalWords?: number, masteredWords?: number, accuracy?: number, studyTime?: number }) {
      this.progress.connect = { ...this.progress.connect, ...progress };
    },

    updateSettings(settings: { showPhonetic?: boolean, showTranslation?: boolean, playPronunciation?: boolean }) {
      this.settings = { ...this.settings, ...settings };
    },

    // 标记单词为已掌握
    markWordAsMastered(wordId: string, mode: 'typing' | 'connect') {
      if (!this.currentWordList) return;
      
      const word = this.currentWordList.words.find(w => w.id === wordId);
      if (word) {
        word.mastered = true;
        
        if (mode === 'typing') {
          this.progress.typing.masteredWords += 1;
        } else {
          this.progress.connect.masteredWords += 1;
        }
      }
    }
  }
}); 