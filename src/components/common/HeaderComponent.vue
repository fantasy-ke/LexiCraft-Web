<template>
  <header class="header">
    <div class="logo">
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
        <router-link to="/home" v-if="isLoggedIn">单词拼写</router-link>
        <router-link to="/connect" v-if="isLoggedIn">连连看</router-link>
        <router-link to="/profile" v-if="isLoggedIn">个人中心</router-link>
      </div>
    </div>
    <div class="user-profile" v-if="isLoggedIn">
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
            <a-menu-item key="logout" @click="handleLogout">退出登录</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { DownOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '../../store/user';
import { useWordStudyStore, type WordList } from '../../store/wordStudy';

export default defineComponent({
  name: 'HeaderComponent',
  components: {
    DownOutlined
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const wordStudyStore = useWordStudyStore();

    const isLoggedIn = computed(() => userStore.isLoggedIn);
    const userInfo = computed(() => userStore.getUserInfo);
    const wordLists = computed(() => wordStudyStore.getWordLists);
    const currentWordList = computed(() => wordStudyStore.getCurrentWordList);

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

    return {
      isLoggedIn,
      userInfo,
      wordLists,
      currentWordList,
      handleWordListSelect,
      handleLogout
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
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  margin-bottom: 16px;

  .logo {
    h1 {
      font-size: 24px;
      font-weight: bold;
      color: #1890ff;
      margin: 0;
    }
  }

  .nav-menu {
    display: flex;
    align-items: center;
    gap: 24px;

    .menu-items {
      display: flex;
      gap: 16px;

      a {
        font-size: 16px;
        color: #333;
        text-decoration: none;
        padding: 6px 12px;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover,
        &.router-link-active {
          color: #1890ff;
          background-color: #f0f5ff;
        }
      }
    }
  }

  .user-profile {
    display: flex;
    align-items: center;
    cursor: pointer;

    .username {
      margin-left: 8px;
      font-size: 14px;
    }
  }
}
</style> 