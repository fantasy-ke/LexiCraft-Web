<template>
  <div class="word-input-container">
    <div class="letter-inputs">
      <div
        v-for="(letter, index) in wordLetters"
        :key="index"
        class="letter-input"
        :class="{
          'correct': inputStates[index] === 'correct',
          'incorrect': inputStates[index] === 'incorrect',
          'active': currentIndex === index
        }"
      >
        <input
          type="text"
          :ref="(el) => { if (el) letterInputs[index] = el  }"
          v-model="userInputs[index]"
          maxlength="1"
          @input="handleInput(index, $event)"
          @keydown="handleKeyDown(index, $event)"
          @focus="currentIndex = index"
          @blur="checkIfComplete"
        />
        <div class="letter-underline"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, watch, onMounted, defineComponent } from 'vue';

export default defineComponent({
  name: 'WordInput',
  props: {
    word: {
      type: String,
      required: true
    }
  },
  emits: ['correct', 'incorrect', 'complete'],
  setup(props, { emit, expose }) {
    const wordLetters = computed(() => props.word.split(''));
    const userInputs = ref<string[]>(Array(props.word.length).fill(''));
    const inputStates = ref<('correct' | 'incorrect' | 'empty')[]>(Array(props.word.length).fill('empty'));
    const currentIndex = ref(0);
    const letterInputs = ref<(any | null)[]>([]);

    // 判断输入是否正确
    const checkLetterInput = (index: number) => {
      if (!userInputs.value[index]) {
        inputStates.value[index] = 'empty';
        return;
      }
      
      if (userInputs.value[index].toLowerCase() === wordLetters.value[index].toLowerCase()) {
        inputStates.value[index] = 'correct';
        emit('correct', index);
      } else {
        inputStates.value[index] = 'incorrect';
        emit('incorrect', index);
        // 添加错误抖动动画
        const input = letterInputs.value[index];
        if (input) {
          input.parentElement?.classList.add('shake');
          setTimeout(() => {
            input.parentElement?.classList.remove('shake');
          }, 500);
        }
      }
    };

    // 检查是否已完成整个单词
    const checkIfComplete = () => {
      if (userInputs.value.every((input, index) => 
        input.toLowerCase() === wordLetters.value[index].toLowerCase())
      ) {
        emit('complete', props.word);
      }
    };

    // 处理输入事件
    const handleInput = (index: number, event: Event) => {
      const input = event.target as HTMLInputElement;
      const value = input.value;
      
      // 确保只能输入字母
      if (value && !/^[a-zA-Z]$/.test(value)) {
        userInputs.value[index] = '';
        return;
      }
      
      checkLetterInput(index);
      
      // 如果正确且不是最后一个字母，自动跳到下一个
      if (inputStates.value[index] === 'correct' && index < wordLetters.value.length - 1) {
        currentIndex.value = index + 1;
        setTimeout(() => {
          letterInputs.value[currentIndex.value]?.focus();
        }, 50);
      }
      
      checkIfComplete();
    };

    // 处理键盘事件
    const handleKeyDown = (index: number, event: KeyboardEvent) => {
      if (event.key === 'Backspace' && !userInputs.value[index] && index > 0) {
        // 如果当前输入框为空且按了 Backspace，跳到上一个输入框
        currentIndex.value = index - 1;
        letterInputs.value[currentIndex.value]?.focus();
        event.preventDefault();
      } else if (event.key === 'ArrowLeft' && index > 0) {
        // 左箭头键，跳到上一个输入框
        currentIndex.value = index - 1;
        letterInputs.value[currentIndex.value]?.focus();
        event.preventDefault();
      } else if (event.key === 'ArrowRight' && index < wordLetters.value.length - 1) {
        // 右箭头键，跳到下一个输入框
        currentIndex.value = index + 1;
        letterInputs.value[currentIndex.value]?.focus();
        event.preventDefault();
      }
    };

    // 重置输入
    const resetInput = () => {
      userInputs.value = Array(props.word.length).fill('');
      inputStates.value = Array(props.word.length).fill('empty');
      currentIndex.value = 0;
      setTimeout(() => {
        letterInputs.value[0]?.focus();
      }, 50);
    };

    // 当单词改变时重置输入
    watch(() => props.word, () => {
      resetInput();
    });

    // 当组件挂载时，聚焦第一个输入框
    onMounted(() => {
      resetInput();
    });

    // 暴露方法
    expose({
      resetInput
    });

    return {
      wordLetters,
      userInputs,
      inputStates,
      currentIndex,
      letterInputs,
      handleInput,
      handleKeyDown,
      checkIfComplete
    };
  }
});
</script>

<style lang="scss" scoped>
.word-input-container {
  display: flex;
  justify-content: center;
  margin: 24px 0;

  .letter-inputs {
    display: flex;
    gap: 8px;

    .letter-input {
      position: relative;
      width: 40px;
      height: 50px;
      
      input {
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        text-align: center;
        font-size: 24px;
        outline: none;
        color: #333;
        text-transform: lowercase;
      }
      
      .letter-underline {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #d9d9d9;
        transition: all 0.3s;
      }
      
      &.active .letter-underline {
        height: 2px;
        background-color: #1890ff;
      }
      
      &.correct {
        input {
          color: #52c41a;
        }
        
        .letter-underline {
          background-color: #52c41a;
        }
      }
      
      &.incorrect {
        input {
          color: #f5222d;
        }
        
        .letter-underline {
          background-color: #f5222d;
        }
      }

      // 错误时的抖动动画
      &.shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      }
    }
  }
}

@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style> 