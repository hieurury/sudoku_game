<script setup lang="ts">
defineProps<{
    title?: string;
    theme?: 'success' | 'danger' | 'warning' | 'info';
}>();


const themeClasses = {
    success: 'bg-green-500 text-white border-green-600',
    danger: 'bg-red-500 text-white border-red-600',
    warning: 'bg-yellow-500 text-white border-yellow-600',
    info: 'bg-blue-500 text-white border-blue-600',
};
</script>

<template>
    <div class=" relative">
        <span
        :class="['absolute -top-2 right-0 text-[10px] border shadow px-0.5', theme ? themeClasses[theme] : 'bg-orange-500 text-white border-orange-600']"
        >{{ title }}</span>
        <slot></slot>
    </div>
</template>

<style scoped>
</style>