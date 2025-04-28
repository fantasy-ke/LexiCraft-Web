<template>
  <footer class="footer">
    <div class="progress-section" v-if="showProgress">
      <div class="progress-item">
        <h3>{{ studyMode === 'spelling' ? '拼写模式' : '连连看模式' }}</h3>
        <div class="progress-bar">
          <div
            class="progress-filled"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="progress-details">
          <span>掌握单词: {{ progress.masteredWords }}/{{ progress.totalWords }}</span>
          <span>正确率: {{ progress.accuracy.toFixed(1) }}%</span>
          <span>学习时长: {{ formatTime(progress.studyTime) }}</span>
        </div>
      </div>
    </div>
    <div class="copyright">
      <p>&copy; {{ new Date().getFullYear() }} LexiCraft. 帮助你更高效地学习英语单词。</p>
      <div class="social-links">
        <a href="#" target="_blank" class="social-link">
          <a-button type="text" shape="circle">
            <template #icon><github-outlined /></template>
          </a-button>
        </a>
        <a href="#" target="_blank" class="social-link">
          <a-button type="text" shape="circle">
            <template #icon><twitter-outlined /></template>
          </a-button>
        </a>
        <a href="#" target="_blank" class="social-link">
          <a-button type="text" shape="circle">
            <template #icon><facebook-outlined /></template>
          </a-button>
        </a>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { GithubOutlined, TwitterOutlined, FacebookOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/store/user';
import { useWordStudyStore } from '@/store/wordStudy';
import { useThemeStore } from '@/store/theme';

export default defineComponent({
  name: 'FooterComponent',
  components: {
    GithubOutlined,
    TwitterOutlined,
    FacebookOutlined
  },
  props: {
    studyMode: {
      type: String as () => 'spelling' | 'connect',
      default: 'spelling'
    }
  },
  setup(props) {
    const route = useRoute();
    const userStore = useUserStore();
    const wordStudyStore = useWordStudyStore();
    const themeStore = useThemeStore();

    const showProgress = computed(() => {
      return route.path === '/home' || route.path === '/connect';
    });

    const progress = computed(() => {
      return props.studyMode === 'spelling' 
        ? wordStudyStore.getSpellingProgress 
        : wordStudyStore.getConnectProgress;
    });

    const progressPercentage = computed(() => {
      if (progress.value.totalWords === 0) return 0;
      return (progress.value.masteredWords / progress.value.totalWords) * 100;
    });

    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      return [
        hours > 0 ? `${hours}h` : '',
        minutes > 0 ? `${minutes}m` : '',
        `${secs}s`
      ].filter(Boolean).join(' ');
    };

    return {
      showProgress,
      progress,
      progressPercentage,
      formatTime,
      theme: themeStore.theme
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/components/FooterComponent.scss';
</style> 