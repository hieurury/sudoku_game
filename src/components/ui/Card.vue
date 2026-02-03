<script setup lang="ts">
import { Icon } from '@iconify/vue';
const {
    title = 'Title',
    description = 'Description',
    rate = 2,
    theme = 'success'
} = defineProps<{
    title?: string;
    description?: string;
    theme?: 'success' | 'error' | 'info' | 'warning';
    rate?: number;
}>();

const icon = 'ic:baseline-star-border';
const filledIcon = 'ic:baseline-star';
const haflIcon = 'ic:baseline-star-half';

const themeClasses = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
};
</script>

<template>
    <div class="border-2 cursor-pointer max-w-xs">
        <h2 :class="`text-2xl font-bold mb-2 border-b-2 border-black dark:border-gray-300 text-center text-white ${themeClasses[theme]}`">{{ title }}</h2>
        <div class="p-2 flex">
            <p class="text-gray-600 dark:text-gray-400 min-h-14 max-h-14">{{ description }}</p>
            <slot></slot>
        </div>
        <div class="w-full flex justify-center items-center p-2 border-t-2">
            <div class="flex space-x-1 items-center">
                <Icon v-for="n in 5" :key="n" :icon="n <= Math.floor(rate) ? filledIcon : (n - rate <= 0.5 && n - rate > 0 ? haflIcon : icon)" :width="n == 3 ? 28 : 24" :height="n == 3 ? 28 : 24" 
                :color="n <= rate ? 'orange' : 'gray'"/>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>