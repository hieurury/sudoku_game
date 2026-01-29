<script setup lang="ts">
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { useThemes } from '../../stores/useThemes';
import { storeToRefs } from 'pinia';

//store
const themeStore = useThemes();
const { theme } = storeToRefs(themeStore);


const iconSwitch = computed(() => theme.value ? 'ic:round-dark-mode' : 'ic:round-light-mode');
</script>

<template>
    <div class="min-w-12">
        <div 
        @click="() => themeStore.toggleTheme()"
        class="w-full h-full border-2 cursor-pointer transition-all duration-200 relative flex justify-start items-center p-px"
        :class="[{
            'bg-emerald-500': theme,
            'bg-white': !theme
        }]">
            <span 
            class="w-1/2 h-full transition-all duration-200 flex justify-center items-center rounded-xs shadow text-gray-200 dark:text-black"
            :class="[{
                'translate-x-full border-2 bg-white': theme,
                'translate-x-0 border-2 border-black bg-emerald-500': !theme
            }]">
                <Icon class="" :icon="iconSwitch" width="12" height="12" />
            </span>
        </div>
    </div>
</template>

<style scoped>
</style>