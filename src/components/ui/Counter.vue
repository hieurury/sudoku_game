<script setup lang="ts">
defineProps<{
    title: string;
    count: number;
    max: number;
    theme: 'success' | 'error' | 'info';
}>();

const themeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
};
</script>

<template>
    <div class="inline-block border-2">
        <h3 
        class="text-lg border-b-2 p-1 px-8 text-white"
        :class="themeClasses[theme]">{{ title }}</h3>
        <div class="text-3xl font-bold p-2 text-center">
            <span>{{ count }}</span>
            /
            <span>{{ max }}</span>
        </div>
    </div>
</template>

<style scoped>
/* css */
</style>