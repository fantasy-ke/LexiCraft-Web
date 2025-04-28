import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'light' | 'dark'>('light');
  
  // 初始化时检查系统主题
  const initTheme = () => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme.value = 'dark';
    }
    applyTheme();
  };

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    applyTheme();
  };

  // 应用主题
  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', theme.value);
    localStorage.setItem('theme', theme.value);
  };

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      theme.value = e.matches ? 'dark' : 'light';
      applyTheme();
    }
  });

  return {
    theme,
    initTheme,
    toggleTheme
  };
}); 