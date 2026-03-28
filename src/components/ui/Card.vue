<script setup lang="ts">
const {
    title = '',
    description = '',
    theme = 'success'
} = defineProps<{
    title?: string;
    description?: string;
    theme?: 'success' | 'error' | 'info' | 'warning';
    icon: string;
}>();

const themeMap = {
    success: {
        bg: 'bg-emerald-500',
        border: 'border-emerald-500',
        text: 'text-emerald-500',
        bars: 1,
    },
    warning: {
        bg: 'bg-yellow-500',
        border: 'border-yellow-500',
        text: 'text-yellow-500',
        bars: 2,
    },
    error: {
        bg: 'bg-red-500',
        border: 'border-red-500',
        text: 'text-red-500',
        bars: 3,
    },
    info: {
        bg: 'bg-blue-500',
        border: 'border-blue-500',
        text: 'text-blue-500',
        bars: 1,
    },
};
</script>

<template>
    <div
        class="group flex flex-col cursor-pointer w-52 border-2 border-gray-300 dark:border-gray-600 hover:-translate-y-1 transition-transform duration-200 select-none"
        :class="'hover:' + themeMap[theme].border"
        @click="$emit('click')"
    >
        <!-- icon area -->
        <div class="w-full flex justify-center items-center py-6" :class="themeMap[theme].bg">
            <img class="rounded-full" width="80" :src="icon" alt="" />
        </div>

        <!-- info area -->
        <div class="p-4 flex flex-col gap-2 bg-white dark:bg-gray-900 flex-1">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold uppercase tracking-widest dark:text-white">{{ title }}</h2>
                <!-- difficulty bars -->
                <div class="flex gap-1 items-end h-5">
                    <span
                        v-for="i in 3"
                        :key="i"
                        class="w-2 transition-colors duration-200"
                        :class="[
                            i <= themeMap[theme].bars ? themeMap[theme].bg : 'bg-gray-200 dark:bg-gray-700',
                            i === 1 ? 'h-2' : i === 2 ? 'h-3.5' : 'h-5'
                        ]"
                    />
                </div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-tight">{{ description }}</p>
            <!-- bottom accent bar -->
            <div class="mt-auto pt-3">
                <div class="h-0.5 w-full" :class="themeMap[theme].bg"></div>
            </div>
        </div>
        <slot></slot>
    </div>
</template>

<style scoped>
</style>