<script setup lang="ts">
const props = defineProps<{
    title: string;
    count: number;
    max: number;
    theme: 'success' | 'error' | 'info';
    progress?: boolean;
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
        class="text-lg font-semibold uppercase border-b-2 p-1 px-8 text-white"
        :class="themeClasses[theme]">{{ title }}</h3>
        <div class="text-3xl font-bold p-2 text-center">
            <span>{{ count }}</span>
            /
            <span>{{ max }}</span>
        </div>
        <div class="p-1 flex flex-col items-start" v-if="progress">
            <div class="text-xs">
                <span :class="`${themeClasses[theme]} border px-1`">{{ Math.round((count / max) * 100) }}%</span>
            </div>
            <div class="w-full h-2 border-2 relative">
                <div 
                :class="`absolute h-full transition-width duration-300 ${themeClasses[theme]}`"
                :style="{
                    width: `${(count / max) * 100}%`
                }"
                ></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* css */
</style>