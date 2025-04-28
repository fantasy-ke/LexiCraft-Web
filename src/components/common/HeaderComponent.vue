<template>
  <header class="header">
    <div class="logo">
      <img src="/logo.svg" alt="LexiCraft Logo" class="logo-image" />
      <h1>LexiCraft</h1>
    </div>
    <div class="nav-menu">
      <a-dropdown v-if="isLoggedIn">
        <a class="ant-dropdown-link" @click.prevent>
          {{ currentWordList ? currentWordList.name : '选择词库' }}
          <down-outlined />
        </a>
        <template #overlay>
          <a-menu @click="handleWordListSelect">
            <a-menu-item v-for="list in wordLists" :key="list.id">{{ list.name }}</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <div class="menu-items">
        <router-link to="/home">单词拼写</router-link>
        <router-link to="/connect">连连看</router-link>
      </div>
    </div>
    <div class="user-actions" v-if="isLoggedIn">
      <a class="theme-toggle" @click="handleThemeToggle">
        <bulb-outlined v-if="isDarkTheme" />
        <bulb-filled v-else />
      </a>
      <a class="notification-icon" @click="goToMessages">
        <bell-outlined />
        <a-badge :count="unreadCount" :dot="unreadCount > 0" />
      </a>
      <a-dropdown>
        <a class="ant-dropdown-link" @click.prevent>
          <a-avatar :src="userInfo.avatar || '/default-avatar.png'" />
          <span class="username">{{ userInfo.username || '用户' }}</span>
        </a>
        <template #overlay>
          <a-menu>
            <a-menu-item key="profile">
              <router-link to="/profile">个人中心</router-link>
            </a-menu-item>
            <a-menu-item key="messages">
              <router-link to="/messages">消息中心</router-link>
            </a-menu-item>
            <a-menu-item key="logout" @click="handleLogout">退出登录</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div class="auth-buttons" v-else>
      <a class="theme-toggle" @click="handleThemeToggle">
        <bulb-outlined v-if="isDarkTheme" />
        <bulb-filled v-else />
      </a>
      <router-link to="/login">
        <a-button type="primary" class="login-btn">登录</a-button>
      </router-link>
      <router-link to="/register">
        <a-button class="register-btn">注册</a-button>
      </router-link>
    </div>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { DownOutlined, BellOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons-vue';
import { useUserStore } from '@/store/user';
import { useWordStudyStore, type WordList } from '@/store/wordStudy';
import { useThemeStore } from '@/store/theme';
import { getUnreadCount } from '@/api/messages';

export default defineComponent({
  name: 'HeaderComponent',
  components: {
    DownOutlined,
    BellOutlined,
    BulbOutlined,
    BulbFilled
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const wordStudyStore = useWordStudyStore();
    const themeStore = useThemeStore();
    const unreadCount = ref(0);

    const isLoggedIn = computed(() => userStore.isLoggedIn);
    const userInfo = computed(() => userStore.getUserInfo);
    const wordLists = computed(() => wordStudyStore.getWordLists);
    const currentWordList = computed(() => wordStudyStore.getCurrentWordList);
    const isDarkTheme = computed(() => themeStore.theme === 'dark');

    const handleWordListSelect = (e: any) => {
      const selectedList = wordLists.value.find(list => list.id === e.key);
      if (selectedList) {
        wordStudyStore.setCurrentWordList(selectedList);
      }
    };

    const handleLogout = () => {
      userStore.logout();
      router.push('/login');
    };

    const goToMessages = () => {
      router.push('/messages');
    };

    // 获取未读消息数量
    const fetchUnreadCount = async () => {
      try {
        // 只有登录用户才获取未读消息
        if (isLoggedIn.value) {
          unreadCount.value = await getUnreadCount();
        }
      } catch (error) {
        console.error('获取未读消息数量失败', error);
      }
    };

    // 初始化时获取未读消息数量
    onMounted(() => {
      themeStore.initTheme();
      fetchUnreadCount();
    });

    const handleThemeToggle = () => {
      themeStore.toggleTheme();
    };

    return {
      isLoggedIn,
      userInfo,
      wordLists,
      currentWordList,
      unreadCount,
      isDarkTheme,
      handleThemeToggle,
      handleWordListSelect,
      handleLogout,
      goToMessages
    };
  }
});
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: var(--card-background);
  box-shadow: var(--box-shadow);
  border-radius: 16px;
  margin-bottom: 16px;

  :deep(.ant-dropdown) {
    .ant-dropdown-menu {
      background-color: var(--card-background);
      border: 1px solid var(--border-color);
      box-shadow: var(--box-shadow);
      
      .ant-dropdown-menu-item {
        color: var(--text-color);
        background-color: var(--card-background);
        
        &:hover {
          background-color: var(--background-color-secondary);
        }
        
        a {
          color: var(--text-color);
          
          &:hover {
            color: var(--primary-color);
          }
        }
      }
    }
  }

  :deep(.ant-dropdown-trigger) {
    background-color: var(--card-background);
    color: var(--text-color);
    
    &:hover {
      color: var(--primary-color);
    }
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;

    .logo-image {
      width: 32px;
      height: 32px;
    }

    h1 {
      font-size: 24px;
      font-weight: bold;
      color: var(--primary-color);
      margin: 0;
    }
  }

  .nav-menu {
    display: flex;
    align-items: center;
    gap: 24px;

    .ant-dropdown-link {
      color: var(--text-color);
      cursor: pointer;
      
      &:hover {
        color: var(--primary-color);
      }
    }

    .menu-items {
      display: flex;
      gap: 16px;

      a {
        font-size: 16px;
        color: var(--text-color);
        text-decoration: none;
        padding: 6px 12px;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover,
        &.router-link-active {
          color: var(--primary-color);
          background-color: var(--background-color-secondary);
        }
      }
    }
  }

  .user-actions {
    display: flex;
    align-items: center;
    gap: 16px;

    .theme-toggle {
      cursor: pointer;
      font-size: 20px;
      color: var(--text-color-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        color: var(--primary-color);
      }
    }

    .notification-icon {
      position: relative;
      cursor: pointer;
      font-size: 20px;
      color: var(--text-color-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        color: var(--primary-color);
      }

      .ant-badge {
        position: absolute;
        top: -2px;
        right: -2px;
      }
    }

    .username {
      margin-left: 8px;
      font-size: 14px;
      color: var(--text-color);
    }
  }

  .auth-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .theme-toggle {
      cursor: pointer;
      font-size: 20px;
      color: var(--text-color-secondary);
      margin-right: 10px;
      
      &:hover {
        color: var(--primary-color);
      }
    }
    
    .login-btn, .register-btn {
      border-radius: 6px;
    }
  }
}
</style> 