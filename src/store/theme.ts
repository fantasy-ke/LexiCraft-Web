import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'light' | 'dark'>('light');
  
  // 初始化时检查本地存储和系统主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      theme.value = savedTheme as 'light' | 'dark';
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
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

  // 立即初始化主题
  initTheme();

  return {
    theme,
    initTheme,
    toggleTheme
  };
}); 