<script lang="ts" setup>
import { useUserStore } from './store/user';
import { onMounted } from 'vue';

const userStore = useUserStore();

onMounted(() => {
  // 检查用户是否已登录
  if (userStore.isLoggedIn) {
    // 可以在这里加载用户数据或执行其他初始化任务
  }
});
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style lang="scss">
// 全局样式已移至 styles/main.scss
</style>
