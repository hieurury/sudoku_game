<script setup lang="ts">
    import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { Icon } from '@iconify/vue';
    import { useI18n } from 'vue-i18n';
    import { useTowerProgress } from '../stores/useTowerProgress';
    import { useGameFile } from '../stores/useGameFile';
    import { useGameStore } from '../stores/useGameState';
    import { isTauriRuntime } from '../utils/dataStorage';
    import type { TowerLevelState } from '../stores/useTowerProgress';
    import { loadTowerLevels, toTowerLevelNumber, getTowerLevelCount } from '../utils/towerLevels';
    //components
    import Button from '../components/ui/Button.vue';
    import Modal from '../components/ui/Modal.vue';
    import Card from '../components/ui/Card.vue';
    import Badge from '../components/ui/Badge.vue';
    import SettingsModal from '../components/partials/SettingsModal.vue';

    const { t } = useI18n();
    const router = useRouter();
    const towerProgress = useTowerProgress();
    const gameStore = useGameStore();
    const gameFile = useGameFile();

    const modalVisible = ref(false);
    const settingsVisible = ref(false);
    const showCustomPanel = ref(false);
    const customNullCells = ref(35);
    const hasSavedQuickGame = ref(false);
    const savedQuickDifficulty = ref<'easy' | 'medium' | 'hard' | null>(null);
    let quickSaveWatcher: ReturnType<typeof setInterval> | null = null;
    let isSyncingQuickSave = false;

    const customDifficultyInfo = computed(() => {
        const n = customNullCells.value;
        if (n <= 25) return { label: 'EASY', color: 'text-emerald-500', bar: 'bg-emerald-500', pct: Math.round((n / 50) * 100) };
        if (n <= 40) return { label: 'MEDIUM', color: 'text-yellow-500', bar: 'bg-yellow-500', pct: Math.round((n / 50) * 100) };
        return { label: 'HARD', color: 'text-red-500', bar: 'bg-red-500', pct: Math.round((n / 50) * 100) };
    });

    const continueGameBtn = computed(() => {
        return hasSavedQuickGame.value;
    });
    const continueBadge = computed(() => {
        const d = savedQuickDifficulty.value;
        if (d === 'easy')   return { title: t('home.modal.easy.title'),   theme: 'success' as const };
        if (d === 'medium') return { title: t('home.modal.medium.title'), theme: 'warning' as const };
        if (d === 'hard')   return { title: t('home.modal.hard.title'),   theme: 'danger'  as const };
        return null;
    });

    function startNewGame() {
        gameStore.clearGameState();
        hasSavedQuickGame.value = false;
        savedQuickDifficulty.value = null;
        showCustomPanel.value = false;
        modalVisible.value = true;
    }
    function continueGame() {
        if (savedQuickDifficulty.value) {
            router.push(`/quick-play?difficulty=${savedQuickDifficulty.value}`);
        }
    }
    function startCustomGame() {
        modalVisible.value = false;
        showCustomPanel.value = false;
        router.push(`/quick-play?difficulty=custom&nullCells=${customNullCells.value}`);
    }

    // ── Tower mode ────────────────────────────────────────────────────────────
    const towerModalVisible = ref(false);
    const levelsData = ref<TowerLevelState[]>([]);
    const levelsLoading = ref(false);
    const totalTowerLevels = getTowerLevelCount();

    async function openTowerModal() {
        towerModalVisible.value = true;
        if (levelsData.value.length > 0) return;
        levelsLoading.value = true;
        try {
            levelsData.value = await loadTowerLevels();
        } catch (error) {
            console.error('Failed to load tower levels', error);
            levelsData.value = [];
        } finally {
            levelsLoading.value = false;
        }
    }

    function closeTowerModal() {
        towerModalVisible.value = false;
    }

    function playTowerLevel(levelId: string | number) {
        const levelNum = toTowerLevelNumber(levelId);
        if (levelNum === null) return;
        closeTowerModal();
        router.push(`/tower-play/${levelNum}`);
    }

    function continueTower() {
        const lp = towerProgress.lastPlayed;
        if (lp) {
            const levelNum = toTowerLevelNumber(lp.levelId);
            if (levelNum === null) return;
            closeTowerModal();
            router.push(`/tower-play/${levelNum}`);
        }
    }

    function getLevelDifficulty(level: TowerLevelState): { label: string; color: string; bars: number } {
        const n = level.null_cell;
        const isTime = level.type === 'time';
        if ((!isTime && n <= 30) || (isTime && n <= 25)) {
            return { label: t('towerPlay.easy'), color: 'bg-emerald-500', bars: 1 };
        }
        if ((!isTime && n <= 38) || (isTime && n <= 36)) {
            return { label: t('towerPlay.medium'), color: 'bg-yellow-500', bars: 2 };
        }
        return { label: t('towerPlay.hard'), color: 'bg-red-500', bars: 3 };
    }

    async function syncQuickContinueState() {
        if (isSyncingQuickSave) return;
        isSyncingQuickSave = true;
        try {
            if (isTauriRuntime()) {
                const fileState = await gameFile.loadGame();
                hasSavedQuickGame.value = fileState !== null;
                savedQuickDifficulty.value = fileState?.gameDifficulty ?? null;
                return;
            }

            const hasSave = await gameStore.loadGame();
            hasSavedQuickGame.value = hasSave;
            savedQuickDifficulty.value = hasSave ? gameStore.gameDifficulty : null;
        } finally {
            isSyncingQuickSave = false;
        }
    }

    function handleWindowFocus() {
        void syncQuickContinueState();
    }

    function handleVisibilityChange() {
        if (!document.hidden) {
            void syncQuickContinueState();
        }
    }

    onMounted(async () => {
        await syncQuickContinueState();
        await towerProgress.loadFromFile();

        if (isTauriRuntime()) {
            window.addEventListener('focus', handleWindowFocus);
            document.addEventListener('visibilitychange', handleVisibilityChange);
            quickSaveWatcher = setInterval(() => {
                void syncQuickContinueState();
            }, 1000);
        }
    });

    onBeforeUnmount(() => {
        if (quickSaveWatcher !== null) {
            clearInterval(quickSaveWatcher);
            quickSaveWatcher = null;
        }
        window.removeEventListener('focus', handleWindowFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    });
</script>

<template>
    <div class="w-full min-h-screen flex flex-col space-y-4 justify-center items-center dark:bg-black/90 bg-white">
        <h1 class="text-7xl uppercase font-semibold dark:text-gray-300 tracking-wider">{{ t('home.title') }}</h1>
        <div class="flex justify-center items-center flex-col">
            <div class="flex flex-col gap-2">
                <Badge
                    v-if="continueGameBtn && continueBadge"
                    :title="continueBadge!.title"
                    :theme="continueBadge!.theme"
                >
                    <Button
                        class="w-64 text-xl flex items-center justify-center"
                        @click="continueGame"
                    >{{ t('home.continueGame') }}</Button>
                </Badge>
                <Button
                class="w-64 text-xl flex items-center justify-center"
                type="danger"
                @click="startNewGame"
                >
                <Icon icon="material-symbols-light:play-arrow-rounded" width="32" height="32" />
                <h3>{{ t('home.newGame') }}</h3>
            </Button>
                <!-- Tower button -->
                <Button
                    class="w-64 text-xl flex items-center justify-center gap-1"
                    type="primary"
                    @click="openTowerModal"
                >
                    <Icon icon="material-symbols-light:trophy-outline-rounded" width="28" height="28" />
                    <h3>{{ t('home.tower') }}</h3>
                </Button>
            </div>
            <div class="border w-full my-4"></div>
            <Button size="none" class="border-2 w-full flex items-center justify-center px-4 py-1 bg-emerald-500 text-white border-black cursor-pointer" @click="settingsVisible = true">
                <Icon icon="material-symbols-light:settings-rounded" width="24" height="24" />
                <h3>{{ t('home.setting') }}</h3>
            </Button>
        </div>
        <SettingsModal v-if="settingsVisible" @close="settingsVisible = false" />
        <Modal
        v-if="modalVisible"
        :title="t('home.modal.title')"
        @close="modalVisible = false; showCustomPanel = false;"
        >
            <Card :title="t('home.modal.easy.title')"
            :description="t('home.modal.easy.description')"
            icon="/gif/earth.gif"
            @click="() => {
                modalVisible = false;
                router.push('/quick-play?difficulty=easy');
            }"
            />
            <Card :title="t('home.modal.medium.title')"
            :description="t('home.modal.medium.description')"
            icon="/gif/mars.gif"
            theme="warning"
            @click="() => {
                modalVisible = false;
                router.push('/quick-play?difficulty=medium');
            }"
            />
            <Card :title="t('home.modal.hard.title')"
            :description="t('home.modal.hard.description')"
            icon="/gif/uranus.gif"
            theme="error"
            @click="() => {
                modalVisible = false;
                router.push('/quick-play?difficulty=hard');
            }"
            />

            <!-- Custom difficulty -->
            <template #footer>
                <div class="w-full mt-2">
                    <button
                        @click="showCustomPanel = !showCustomPanel"
                        class="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors cursor-pointer group"
                    >
                        <span class="uppercase tracking-widest font-bold text-sm dark:text-white flex items-center gap-2">
                            <Icon icon="material-symbols-light:tune-rounded" width="20" height="20" />
                            {{ t('home.modal.custom') }}
                        </span>
                        <Icon
                            :icon="showCustomPanel ? 'material-symbols-light:keyboard-arrow-up' : 'material-symbols-light:keyboard-arrow-down'"
                            width="20" height="20"
                            class="text-gray-400 group-hover:text-emerald-500 transition-colors"
                        />
                    </button>

                    <!-- expanded panel -->
                    <div v-if="showCustomPanel" class="border-2 border-t-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-4 flex flex-col gap-4">
                        <!-- cell count + label -->
                        <div class="flex items-center justify-between">
                            <span class="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">{{ t('home.modal.emptyCells') }}</span>
                            <div class="flex items-center gap-2">
                                <span class="text-2xl font-bold tabular-nums dark:text-white">{{ customNullCells }}</span>
                                <span class="text-xs font-bold uppercase tracking-widest" :class="customDifficultyInfo.color">{{ customDifficultyInfo.label }}</span>
                            </div>
                        </div>

                        <!-- slider -->
                        <div class="relative">
                            <input
                                type="range"
                                min="10"
                                max="50"
                                v-model.number="customNullCells"
                                class="custom-slider w-full"
                            />
                            <div class="flex justify-between text-xs text-gray-400 mt-1 select-none">
                                <span>10</span>
                                <span>25</span>
                                <span>40</span>
                                <span>50</span>
                            </div>
                        </div>

                        <!-- difficulty bar -->
                        <div>
                            <div class="flex justify-between text-xs uppercase tracking-widest text-gray-400 mb-1">
                                <span>{{ t('home.modal.difficulty') }}</span>
                                <span :class="customDifficultyInfo.color">{{ customDifficultyInfo.pct }}%</span>
                            </div>
                            <div class="w-full h-2 bg-gray-200 dark:bg-gray-700">
                                <div
                                    class="h-2 transition-all duration-200"
                                    :class="customDifficultyInfo.bar"
                                    :style="{ width: customDifficultyInfo.pct + '%' }"
                                />
                            </div>
                        </div>

                        <!-- start button -->
                        <button
                            @click="startCustomGame"
                            class="w-full py-2 border-2 border-emerald-500 bg-emerald-500 text-white uppercase tracking-widest text-sm font-bold hover:bg-emerald-600 hover:border-emerald-600 transition-colors cursor-pointer"
                        >
                            {{ t('home.modal.start') }}
                        </button>
                    </div>
                </div>
            </template>
        </Modal>

        <!-- Tower Level Selection Modal -->
        <div
            v-if="towerModalVisible"
            @click="closeTowerModal"
            class="fixed inset-0 flex justify-center items-center bg-black/20 z-50 p-4"
        >
            <div
                @click.stop
                class="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 shadow-[6px_6px_0px_rgba(0,0,0,0.25)] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.08)] px-6 py-6 w-full max-w-3xl max-h-[90vh] flex flex-col"
            >
                <!-- header -->
                <div class="flex items-center justify-between mb-4 gap-4">
                    <div>
                        <h2 class="text-3xl uppercase font-bold tracking-widest dark:text-white flex items-center gap-2">
                            <Icon icon="material-symbols-light:trophy-outline-rounded" width="32" height="32" class="text-yellow-500" />
                            {{ t('home.towerModal.title') }}
                        </h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {{ t('home.towerModal.completed') }}: {{ towerProgress.completedCount }} / {{ totalTowerLevels }}
                        </p>
                    </div>
                    <button
                        @click="closeTowerModal"
                        class="text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl leading-none cursor-pointer transition-colors"
                    >✕</button>
                </div>

                <!-- Continue button -->
                <div v-if="towerProgress.hasLastPlayed" class="mb-4">
                    <button
                        @click="continueTower"
                        class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer border-2 border-blue-600"
                    >
                        <Icon icon="material-symbols-light:play-circle-outline" width="22" height="22" />
                        {{ t('home.towerModal.continue') }} — {{ t('towerPlay.level') }} {{ towerProgress.lastPlayed?.levelId }}
                    </button>
                </div>

                <!-- Loading -->
                <div v-if="levelsLoading" class="flex justify-center items-center py-12">
                    <Icon icon="material-symbols-light:progress-activity" width="48" height="48" class="animate-spin dark:text-white" />
                </div>

                <!-- Level timeline - horizontal zigzag scroll -->
                <div v-else class="flex-1 overflow-x-auto overflow-y-hidden">
                    <div class="flex flex-row items-center px-6" style="min-width: max-content; height: 180px;">
                        <template v-for="(level, idx) in levelsData" :key="level.id">
                            <!-- Node -->
                            <div
                                :class="[
                                    'relative border-2 p-2 flex flex-col items-center justify-center gap-1 transition-all duration-150 select-none shrink-0',
                                    'w-[68px]',
                                    idx % 2 === 0 ? '-translate-y-[38px]' : 'translate-y-[38px]',
                                    towerProgress.isLevelCompleted(level.id)
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 cursor-pointer hover:scale-105'
                                        : towerProgress.isLevelUnlocked(level)
                                            ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 cursor-pointer hover:border-blue-400 hover:scale-105'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed opacity-50'
                                ]"
                                @click="towerProgress.isLevelUnlocked(level) ? playTowerLevel(level.id) : undefined"
                            >
                                <span class="text-base font-bold dark:text-white tabular-nums leading-none">{{ String(idx + 1).padStart(2,'0') }}</span>
                                <div class="flex gap-0.5 items-end h-3 mt-0.5">
                                    <span
                                        v-for="b in 3" :key="b"
                                        :class="[
                                            'w-1.5',
                                            b <= getLevelDifficulty(level).bars ? getLevelDifficulty(level).color : 'bg-gray-200 dark:bg-gray-700',
                                            b === 1 ? 'h-1' : b === 2 ? 'h-2' : 'h-3',
                                        ]"
                                    />
                                </div>
                                <span :class="['text-[10px] font-bold leading-none mt-0.5', level.type === 'time' ? 'text-blue-500' : 'text-red-500']">
                                    {{ level.type === 'time' ? '⏱' : '✗' }}
                                </span>
                                <Icon
                                    v-if="towerProgress.isLevelCompleted(level.id)"
                                    icon="material-symbols-light:check-circle-rounded"
                                    width="13" height="13"
                                    class="absolute top-0.5 right-0.5 text-emerald-500"
                                />
                                <Icon
                                    v-else-if="!towerProgress.isLevelUnlocked(level)"
                                    icon="material-symbols-light:lock-outline"
                                    width="13" height="13"
                                    class="absolute top-0.5 right-0.5 text-gray-400"
                                />
                            </div>

                            <!-- Diagonal connector -->
                            <div
                                v-if="idx < levelsData.length - 1"
                                class="shrink-0 h-px bg-gray-300 dark:bg-gray-600"
                                :class="idx % 2 === 0 ? 'zigzag-down' : 'zigzag-up'"
                                style="width: 44px;"
                            />
                        </template>
                    </div>
                </div>

                <!-- stats footer -->
                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    <div>
                        <div class="font-bold text-base dark:text-white">{{ towerProgress.totalPlays }}</div>
                        <div class="uppercase tracking-widest">{{ t('home.towerModal.totalPlays') }}</div>
                    </div>
                    <div>
                        <div class="font-bold text-base dark:text-white">{{ towerProgress.totalFailures }}</div>
                        <div class="uppercase tracking-widest">{{ t('home.towerModal.totalFailures') }}</div>
                    </div>
                    <div>
                        <div class="font-bold text-base dark:text-white">{{ Math.floor(towerProgress.totalPlayTime / 60) }}m {{ towerProgress.totalPlayTime % 60 }}s</div>
                        <div class="uppercase tracking-widest">{{ t('home.towerModal.totalTime') }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.zigzag-down {
    transform: rotate(60deg);
    transform-origin: left center;
}
.zigzag-up {
    transform: rotate(-60deg);
    transform-origin: left center;
}
.custom-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    background: #d1d5db;
    outline: none;
    cursor: pointer;
}
.custom-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #097d43;
    border: 2px solid #fff;
    outline: 2px solid #097d43;
    cursor: pointer;
    border-radius: 0;
}
.custom-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #097d43;
    border: 2px solid #fff;
    outline: 2px solid #097d43;
    cursor: pointer;
    border-radius: 0;
}
</style>