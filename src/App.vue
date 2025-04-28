<script lang="ts" setup>
import { onMounted } from 'vue';
import { useThemeStore } from '@/store/theme';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.initTheme();
});
</script>

<template>
  <router-view />
</template>

<style>
@import '@/styles/theme.scss';
</style>
