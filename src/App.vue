<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { useThemes } from './stores/useThemes';
import { watch } from 'vue';


const themeStore = useThemes();
const { theme } = storeToRefs(themeStore);

watch(theme, (newVal) => {
  if (newVal) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, { immediate: true });
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>
</style>