import type { ApiResponse } from './common.model';

/**
 * 单词定义
 */
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

/**
 * 词库定义
 */
export interface WordList {
  id: string;
  name: string;
  description?: string;
  words: Word[];
}

/**
 * 词库响应
 */
export type WordListResponse = ApiResponse<WordList>;

/**
 * 词库列表响应
 */
export type WordListsResponse = ApiResponse<WordList[]>; 