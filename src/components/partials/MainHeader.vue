<script setup lang="ts">
import { useRouter } from 'vue-router';
//components
import Switch from '../ui/Switch.vue';

const router = useRouter();
</script>

<template>
    <div class="w-full dark:bg-slate-800/90 dark:text-white sticky top-0 shadow-md flex justify-between items-center z-999">
        <div>
            <div @click="() => router.push('/')" class="cursor-pointer bg-emerald-500 dark:text-gray-300 text-white px-4 py-1">
                <h3 class="text-4xl font-semibold">SUKU</h3>
                <p class="text-sm border-t border-gray-300">Sudoku game</p>
            </div>
        </div>
        <div class="flex gap-2 px-4">
            <button>Trợ giúp</button>
            <Switch />
        </div>
    </div>
</template>

<style scoped>
</style>