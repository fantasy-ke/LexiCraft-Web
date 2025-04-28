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
        <router-link to="/home">
          <form-outlined />
          单词拼写
        </router-link>
        <router-link to="/connect">
          <link-outlined />
          连连看
        </router-link>
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
              <router-link to="/profile">
                <user-outlined />
                个人中心
              </router-link>
            </a-menu-item>
            <a-menu-item key="messages">
              <router-link to="/messages">
                <message-outlined />
                消息中心
              </router-link>
            </a-menu-item>
            <a-menu-item key="logout" @click="handleLogout">
              <logout-outlined />
              退出登录
            </a-menu-item>
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
import { 
  DownOutlined, 
  BellOutlined, 
  BulbOutlined, 
  BulbFilled,
  FormOutlined,
  LinkOutlined,
  UserOutlined,
  MessageOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue';
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
    BulbFilled,
    FormOutlined,
    LinkOutlined,
    UserOutlined,
    MessageOutlined,
    LogoutOutlined
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
@use '@/styles/components/HeaderComponent.scss';
</style> 