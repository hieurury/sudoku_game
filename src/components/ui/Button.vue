<script setup lang="ts">
import { onMounted } from 'vue';
import { playSound, loadSound } from '../../utils/sound';


onMounted(() => {
    loadSound('click', '/sounds/click.mp3');
});

const {
    disabled = false,
    type = 'default'
} = defineProps<{
    disabled?: boolean;
    type?: 'default' | 'primary' | 'warning' | 'danger';
}>();

const styles = {
    default: "bg-emerald-500",
    primary: "bg-blue-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
}

function handleClick() {
    playSound('click');
}
</script>

<template>
    <button 
    @click="handleClick"
    :class="`${styles[type]} shadow-[0_6px_2px_rgba(0,0,0,0.5)] border-2 dark:text-gray-300 text-white px-6 py-1 cursor-pointer
    active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 ease-in`"
    :disabled="disabled">
        <slot></slot>
    </button>
</template>

<style scoped>
</style>