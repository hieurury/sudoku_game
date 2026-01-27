<script setup lang="ts">
    const {
        title = 'information',
        type = 'info'
    } = defineProps<{
        title?: string;
        type?: 'default' | 'warning' | 'danger';
    }>();

    const styles = {
        default: "bg-slate-800",
        warning: "bg-yellow-500",
        danger: "bg-red-500",
        info: "bg-blue-700",
    }
</script>

<template>
    <div class="my-4 flex justify-center items-center gap-2">
        <div :class="`border border-transparent flex-9 h-0.5 ${styles[type]}`"></div>
        <div :class="`${styles[type]} px-1 border text-xs text-white uppercase`">{{ title }}</div>
        <div :class="`border border-transparent flex-1 h-0.5 ${styles[type]}`"></div>
    </div>
</template>

<style scoped>
</style>