<script setup lang="ts">
const {
    title = 'Modal Title',
} = defineProps<{
    title?: string;
}>();
</script>

<template>
    <div class="fixed top-0 left-0 bottom-0 right-0 flex justify-center items-center">
        <div class="min-w-lg border-3 shadow dark:bg-slate-700 bg-white px-4 py-4">
            <h2 class="text-4xl uppercase text-center my-2">{{ title }}</h2>
            <div class="flex flex-wrap gap-2 p-4">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>