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
.footer {
  padding: 16px 24px;
  border-radius: 16px;
  background-color: var(--card-background);
  box-shadow: var(--box-shadow);
  margin-top: 16px;

  .progress-section {
    margin-bottom: 16px;

    .progress-item {
      h3 {
        font-size: 16px;
        margin-bottom: 8px;
        color: var(--text-primary-color);
      }

      .progress-bar {
        height: 8px;
        background-color: var(--progress-bg-color);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;

        .progress-filled {
          height: 100%;
          background-color: var(--primary-color);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
      }

      .progress-details {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: var(--text-secondary-color);
      }
    }
  }

  .copyright {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
    
    p {
      color: var(--text-secondary-color);
      font-size: 14px;
      margin: 0;
    }

    .social-links {
      display: flex;
      gap: 8px;
    }
  }
}
</style> 