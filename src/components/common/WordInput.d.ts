import { DefineComponent } from 'vue';

declare const WordInput: DefineComponent<
  { word: string },
  {},
  {},
  {},
  {},
  {},
  {},
  {
    resetInput: () => void;
  }
>;

export default WordInput; 