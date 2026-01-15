<script setup lang="ts">

    const {
        type = 'button',
        disabled = false
    } = defineProps<{
        type?: 'button' | 'submit' | 'reset';
        disabled?: boolean;
    }>();


</script>

<template>
    <button 
    class="shadow-[0_6px_2px_rgba(0,0,0,0.5)] rounded bg-emerald-500 dark:text-gray-300 text-white px-12 py-1 m-2 cursor-pointer
    active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 ease-in-out"
    :type="type" 
    :disabled="disabled">
        <slot></slot>
    </button>
</template>

<style scoped>
</style>