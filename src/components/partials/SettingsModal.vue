<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { useThemes } from '../../stores/useThemes';
import { useSettings } from '../../stores/useSettings';
import { setLocale, type Locale } from '../../i18n/index.ts';
import { storeToRefs } from 'pinia';
import { playSound } from '../../utils/sound';

const emit = defineEmits<{ (e: 'close'): void }>();

const { t, locale } = useI18n();
const themeStore = useThemes();
const settingsStore = useSettings();
const { theme } = storeToRefs(themeStore);
const { soundEnabled } = storeToRefs(settingsStore);

type SettingsTab = 'theme' | 'sounds' | 'language';
const activeTab = ref<SettingsTab>('theme');

const navItems: { key: SettingsTab; icon: string; labelKey: string }[] = [
    { key: 'theme',    icon: 'material-symbols-light:palette-outline',   labelKey: 'settings.theme.title'    },
    { key: 'sounds',   icon: 'material-symbols-light:volume-up-outline', labelKey: 'settings.sounds.title'   },
    { key: 'language', icon: 'material-symbols-light:language',          labelKey: 'settings.language.title' },
];

const languages = [
    { code: 'en', label: 'English',    native: 'English',      flag: '🇺🇸' },
    { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt',   flag: '🇻🇳' },
];

function selectLocale(lang: Locale) {
    if (locale.value !== lang) {
        setLocale(lang);
        playSound('click');
    }
}

function selectTheme(dark: boolean) {
    if (theme.value !== dark) {
        themeStore.setTheme(dark);
    }
}
</script>

<template>
    <!-- backdrop -->
    <div
        @click="emit('close')"
        class="fixed inset-0 flex justify-center items-center bg-black/20 z-50"
    >
        <!-- panel -->
        <div
            @click.stop
            class="flex w-175 max-w-[96vw] min-h-105 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 shadow-[6px_6px_0px_rgba(0,0,0,0.25)] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.08)]"
        >
            <!-- ── Left sidebar 1/3 ─────────────────────────────── -->
            <div class="w-55 shrink-0 bg-gray-50 dark:bg-gray-900 border-r-2 border-gray-300 dark:border-gray-600 flex flex-col">
                <!-- sidebar header -->
                <div class="px-5 py-5 border-b-2 border-gray-300 dark:border-gray-600">
                    <h2 class="text-xl uppercase font-bold tracking-widest dark:text-white">
                        {{ t('settings.title') }}
                    </h2>
                </div>

                <!-- nav items -->
                <nav class="flex flex-col py-2 flex-1">
                    <button
                        v-for="item in navItems"
                        :key="item.key"
                        @click="activeTab = item.key"
                        class="relative flex items-center gap-3 py-3.5 pr-4 text-left uppercase tracking-widest text-sm font-bold cursor-pointer transition-colors duration-150"
                        :class="
                            activeTab === item.key
                                ? 'pl-4.25 border-l-4 border-emerald-500 text-emerald-500 bg-white dark:bg-gray-950'
                                : 'pl-4.25 border-l-4 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-800/50'
                        "
                    >
                        <Icon :icon="item.icon" width="20" height="20" />
                        {{ t(item.labelKey) }}
                    </button>
                </nav>
            </div>

            <!-- ── Right content 2/3 ────────────────────────────── -->
            <div class="flex-1 flex flex-col min-w-0">
                <!-- right header -->
                <div class="flex items-center justify-between px-6 py-5 border-b-2 border-gray-300 dark:border-gray-600">
                    <div class="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                        <Icon
                            :icon="navItems.find(n => n.key === activeTab)!.icon"
                            width="16" height="16"
                        />
                        <span class="text-xl uppercase tracking-widest font-bold">
                            {{ t(`settings.${activeTab}.title`) }}
                        </span>
                    </div>
                    <button
                        @click="emit('close')"
                        class="text-gray-400 hover:text-gray-800 dark:hover:text-white text-xl leading-none cursor-pointer transition-colors"
                    >✕</button>
                </div>

                <!-- right body -->
                <div class="flex-1 px-6 py-6">

                    <!-- ─ THEME ─────────────────────────────────── -->
                    <div v-if="activeTab === 'theme'" class="flex flex-col gap-5">
                        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {{ t('settings.theme.description') }}
                        </p>
                        <div class="grid grid-cols-2 gap-3">
                            <!-- Light -->
                            <button
                                @click="selectTheme(false)"
                                class="flex flex-col items-center gap-3 border-2 py-7 cursor-pointer transition-colors duration-150"
                                :class="!theme
                                    ? 'border-emerald-500'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'"
                            >
                                <div
                                    class="w-12 h-12 border-2 flex items-center justify-center"
                                    :class="!theme ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'"
                                >
                                    <Icon icon="material-symbols-light:light-mode-outline" width="28" height="28" />
                                </div>
                                <span
                                    class="text-xs uppercase tracking-widest font-bold"
                                    :class="!theme ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'"
                                >
                                    {{ t('settings.theme.light') }}
                                </span>
                                <span
                                    class="w-2 h-2 rounded-full transition-colors"
                                    :class="!theme ? 'bg-emerald-500' : 'bg-transparent'"
                                ></span>
                            </button>

                            <!-- Dark -->
                            <button
                                @click="selectTheme(true)"
                                class="flex flex-col items-center gap-3 border-2 py-7 cursor-pointer transition-colors duration-150"
                                :class="theme
                                    ? 'border-emerald-500'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'"
                            >
                                <div
                                    class="w-12 h-12 border-2 flex items-center justify-center"
                                    :class="theme ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'"
                                >
                                    <Icon icon="material-symbols-light:dark-mode-outline" width="28" height="28" />
                                </div>
                                <span
                                    class="text-xs uppercase tracking-widest font-bold"
                                    :class="theme ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'"
                                >
                                    {{ t('settings.theme.dark') }}
                                </span>
                                <span
                                    class="w-2 h-2 rounded-full transition-colors"
                                    :class="theme ? 'bg-emerald-500' : 'bg-transparent'"
                                ></span>
                            </button>
                        </div>
                    </div>

                    <!-- ─ SOUNDS ──────────────────────────────────── -->
                    <div v-else-if="activeTab === 'sounds'" class="flex flex-col gap-5">
                        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {{ t('settings.sounds.description') }}
                        </p>

                        <button
                            @click="settingsStore.toggleSound()"
                            class="flex items-center justify-between border-2 px-5 py-4 w-full cursor-pointer transition-colors duration-150 text-left"
                            :class="soundEnabled
                                ? 'border-emerald-500'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'"
                        >
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-10 h-10 border-2 flex items-center justify-center shrink-0"
                                    :class="soundEnabled
                                        ? 'border-emerald-500 text-emerald-500'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'"
                                >
                                    <Icon
                                        :icon="soundEnabled
                                            ? 'material-symbols-light:volume-up-rounded'
                                            : 'material-symbols-light:volume-off-rounded'"
                                        width="22" height="22"
                                    />
                                </div>
                                <div>
                                    <p class="text-sm uppercase tracking-widest font-bold dark:text-white">
                                        {{ soundEnabled ? t('settings.sounds.on') : t('settings.sounds.off') }}
                                    </p>
                                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {{ t('settings.sounds.hint') }}
                                    </p>
                                </div>
                            </div>

                            <!-- Custom toggle pill -->
                            <div
                                class="w-12 h-6 border-2 relative shrink-0 transition-colors duration-200"
                                :class="soundEnabled
                                    ? 'bg-emerald-500 border-emerald-600'
                                    : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'"
                            >
                                <span
                                    class="absolute top-0 bottom-0 my-auto w-4 h-full border border-white/60 bg-white shadow transition-all duration-200"
                                    :class="soundEnabled ? 'translate-x-6' : 'translate-x-0'"
                                ></span>
                            </div>
                        </button>
                    </div>

                    <!-- ─ LANGUAGE ────────────────────────────────── -->
                    <div v-else-if="activeTab === 'language'" class="flex flex-col gap-5">
                        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {{ t('settings.language.description') }}
                        </p>

                        <div class="flex flex-col gap-2">
                            <button
                                v-for="lang in languages"
                                :key="lang.code"
                                @click="selectLocale(lang.code as Locale)"
                                class="flex items-center justify-between border-2 px-4 py-3.5 cursor-pointer transition-colors duration-150 w-full text-left"
                                :class="locale === lang.code
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'"
                            >
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl select-none leading-none">{{ lang.flag }}</span>
                                    <div>
                                        <p class="text-sm uppercase tracking-widest font-bold dark:text-white">
                                            {{ lang.label }}
                                        </p>
                                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                            {{ lang.native }}
                                        </p>
                                    </div>
                                </div>
                                <Icon
                                    v-if="locale === lang.code"
                                    icon="material-symbols-light:check-circle-rounded"
                                    width="22" height="22"
                                    class="text-emerald-500 shrink-0"
                                />
                                <span v-else class="w-5.5 shrink-0"></span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>
