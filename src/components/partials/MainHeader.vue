<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { setLocale, type Locale } from '../../i18n/index.ts';
//components
import Switch from '../ui/Switch.vue';

const router = useRouter();
const { t, locale } = useI18n();

function toggleLocale() {
    const next: Locale = locale.value === 'en' ? 'vi' : 'en';
    setLocale(next);
}
</script>

<template>
    <div class="w-full dark:bg-slate-800/90 dark:text-white sticky top-0 shadow-md flex justify-between items-center z-999">
        <div>
            <div @click="() => router.push('/')" class="cursor-pointer bg-emerald-500 dark:text-gray-300 text-white px-4 py-1">
                <h3 class="text-4xl font-semibold">SUKU</h3>
                <p class="text-sm border-t border-gray-300">Sudoku game</p>
            </div>
        </div>
        <div class="flex gap-2 px-4 items-center">
            <button>{{ t('header.help') }}</button>
            <button
                @click="toggleLocale"
                class="px-2 py-1 text-sm font-bold uppercase border border-current rounded-sm hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors cursor-pointer"
                :title="locale === 'en' ? 'Switch to Vietnamese' : 'Switch to English'"
            >
                {{ locale === 'en' ? 'VI' : 'EN' }}
            </button>
            <Switch />
        </div>
    </div>
</template>

<style scoped>
</style>