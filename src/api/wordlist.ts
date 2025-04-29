import api from './index';
import type { WordList, Word } from './model/wordlist.model';
import cet4WordList from '../assets/wordlists/cet4.json';
import ieltsWordList from '../assets/wordlists/ielts.json';

// 模拟API请求，实际项目中应该从后端获取
export const fetchWordLists = async (): Promise<WordList[]> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  return [cet4WordList, ieltsWordList] as WordList[];
};

export const fetchWordList = async (id: string): Promise<WordList> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (id === 'cet4') {
    return cet4WordList as WordList;
  } else if (id === 'ielts') {
    return ieltsWordList as WordList;
  }
  
  throw new Error('词库不存在');
};

// 模拟上传自定义词库
export const uploadWordList = async (wordList: WordList): Promise<WordList> => {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟服务器处理
  const newId = `custom_${Date.now()}`;
  return {
    ...wordList,
    id: newId
  };
};

// 获取单词发音
export const getWordPronunciation = (word: string): string => {
  // 使用有道词典API获取单词发音
  return `https://dict.youdao.com/dictvoice?audio=${word}&type=2`;
}; 