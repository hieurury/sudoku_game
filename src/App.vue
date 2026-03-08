<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { useThemes } from './stores/useThemes';
import { useSettings } from './stores/useSettings';
import { watch, onMounted } from 'vue';


const themeStore = useThemes();
const settingsStore = useSettings();
const { theme } = storeToRefs(themeStore);

onMounted(async () => {
  await Promise.all([
    themeStore.loadFromFile(),
    settingsStore.loadFromFile(),
  ]);
});

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