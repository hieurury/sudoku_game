<script setup lang="ts">
const {
    title = '',
} = defineProps<{
    title?: string;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();
function voidClick() {
    emit('close');
}
</script>

<template>
    <div
        @click="voidClick"
        class="fixed inset-0 flex justify-center items-center bg-black/20 z-50"
    >
        <div
            @click.stop
            class="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 shadow-[6px_6px_0px_rgba(0,0,0,0.25)] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.08)] px-6 py-6"
        >
            <!-- header -->
            <div class="flex items-center justify-between mb-6 gap-16">
                <h2 class="text-3xl uppercase font-bold tracking-widest dark:text-white">{{ title }}</h2>
                <button
                    @click="voidClick"
                    class="text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl leading-none cursor-pointer transition-colors"
                >✕</button>
            </div>
            <!-- cards -->
            <div class="flex flex-wrap gap-4">
                <slot></slot>
            </div>
            <!-- footer slot -->
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<style scoped>
</style>