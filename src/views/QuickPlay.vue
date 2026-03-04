<script setup lang="ts">
import { onMounted, watch, ref, computed } from 'vue';
import { useGameStore } from '../stores/useGameState';
import { useGameFile } from '../stores/useGameFile';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { loadSound, playSound } from '../utils/sound';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';

//components
import Counter from '../components/ui/Counter.vue';
import Button from '../components/ui/Button.vue';
import Divider from '../components/ui/Divider.vue';
import Popup from '../components/ui/Popup.vue';
import SettingsModal from '../components/partials/SettingsModal.vue';

const { t } = useI18n();

const gameStore = useGameStore();
const gameFile = useGameFile();
const { gameBoard, playerBoard, currentFocus, cellStatus } = storeToRefs(gameStore);
const router = useRouter();
const route = useRoute();

// const isWin = ref<boolean>(false);
const caninvalid = ref<number>(0);
const inValidCount = ref<number>(0);
const countProgress = ref<number>(0);
const nullCells = ref<number>(0);
const isCheckComplete = ref<boolean>(false);
const isLoading = ref<boolean>(false);
//popup control
const popupVisible = ref<boolean>(false);
const popupTitle = ref<string>('Title');
const popupDescription = ref<string>('Description');
const popupPositive = ref<() => void>(() => {});
const popupNegative = ref<() => void>(() => {});
//settings
const settingsVisible = ref<boolean>(false);
//game settings
type GameDifficulty = 'easy' | 'medium' | 'hard';
const isCustomMode = computed(() => route.query.difficulty === 'custom');
const customNullCells = computed<number>(() => {
    const n = Number(route.query.nullCells);
    return n > 0 ? n : 35;
});
const gameDifficulty = computed<GameDifficulty>(() => {
    const difficultyParam = route.query.difficulty;
    if (difficultyParam === 'easy' || difficultyParam === 'medium' || difficultyParam === 'hard') {
        return difficultyParam as GameDifficulty;
    }
    return 'easy';
});

function runWithLoading(fn: () => void) {
    isLoading.value = true;
    setTimeout(() => {
        fn();
        loadGameCounter();
        isLoading.value = false;
    }, 50);
}

onMounted(() => {
    console.log(route);
    loadSound('target', '/sounds/target.mp3');
    loadSound('gameOver', '/sounds/game_over.mp3');
    loadSound('gameWin', '/sounds/game_win.mp3');
    runWithLoading(() => {
        if (isCustomMode.value) {
            gameStore.newGameCustom(3, customNullCells.value);
        } else {
            gameStore.initGame(3, gameDifficulty.value);
        }
    });
});

function newGame() {
    resetFocus();
    runWithLoading(() => {
        if (isCustomMode.value) {
            gameStore.newGameCustom(3, customNullCells.value);
        } else {
            gameStore.resetGame(3, gameDifficulty.value);
        }
    });

    //poup control
    popupVisible.value = false;
}

function handleInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    const record = target.getAttribute('record');
    if (record) {
        const data = JSON.parse(record);
        const value = Number(target.value) || 0;
        gameStore.updateCell(data.row, data.col, value);
    }

    // Cập nhật số lượt sai
    loadGameCounter();

    // Check win condition
    if (gameStore.isWin()) {
        handleWin();
    }
    if (gameStore.isLose()) {
        handleLose();
    }
}

function handleFocus(e: FocusEvent) {
    const target = e.target as HTMLInputElement;
    const record = target.getAttribute('record');
    if (record) {
        const data = JSON.parse(record);
        gameStore.setFocus(data);
    }
}

function resetFocus() {
    gameStore.clearPlayerBoard();
}

//lúc win
function handleWin() {
    popupTitle.value = t('quickPlay.popup.congrats');
    popupDescription.value = t('quickPlay.popup.congratsDesc');
    popupPositive.value = newGame;
    popupNegative.value = () => {
        gameStore.resetGame(3, gameDifficulty.value);
    };
    popupVisible.value = true;
    playSound('gameWin');
}

//lúc thua
function handleLose() {
    popupTitle.value = t('quickPlay.popup.gameOver');
    popupDescription.value = t('quickPlay.popup.gameOverDesc');
    popupPositive.value = newGame;
    popupNegative.value = () => {
        gameStore.clearGameState();
        router.push('/');
    };
    popupVisible.value = true;
    playSound('gameOver');
}

//hiện popup
function handlePopup() {
    popupTitle.value = t('quickPlay.popup.confirm');
    popupDescription.value = t('quickPlay.popup.confirmDesc');
    popupPositive.value = newGame;
    popupNegative.value = () => { popupVisible.value = false };
    popupVisible.value = true;
}

//thoát game
function handleExit() {
    popupTitle.value = t('quickPlay.popup.exit');
    popupDescription.value = t('quickPlay.popup.exitDesc');
    popupPositive.value = () => { router.push('/'); };
    popupNegative.value = () => { popupVisible.value = false; };
    popupVisible.value = true;
}

//tải số liệu trò chơi
function loadGameCounter() {
    inValidCount.value = gameStore.getInvalidCount;
    caninvalid.value = gameStore.getCanInvalid;
    countProgress.value = gameStore.getGameProgress;
    nullCells.value = gameStore.getGameNullCell;
}

watch(currentFocus, (newVal) => {
    console.log('Current Focus Changed:', newVal);
});
</script>

<template>
    <Popup 
    v-if="popupVisible"
    :title="popupTitle"
    :description="popupDescription"
    @positive="popupPositive"
    @negative="popupNegative"
    />
    <SettingsModal v-if="settingsVisible" @close="settingsVisible = false" />

    <!-- Fixed top-right toolbar -->
    <div class="fixed top-2 right-2 z-40 flex items-stretch border-b-2 border-l-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 shadow-[0_2px_0px_rgba(0,0,0,0.1)]">
        <Button
            size="none"
            @click="handleExit"
            type="danger"
            class="flex items-center gap-2 px-1 py-1 text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
        >
            <Icon icon="material-symbols-light:exit-to-app-rounded" width="18" height="18" />
            {{ t('quickPlay.exit') }}
        </Button>
        <div class="w-px bg-gray-300 dark:bg-gray-600 self-stretch"></div>
        <Button
            size="none"
            type="primary"
            @click="settingsVisible = true"
            class="flex items-center gap-2 px-1 py-1 text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
        >
            <Icon icon="material-symbols-light:settings-rounded" width="18" height="18" />
            {{ t('home.setting') }}
        </Button>
    </div>

    <div class="min-h-screen flex items-center justify-center p-4">
        <!-- Loading overlay -->
        <div
            v-if="isLoading"
            class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm"
        >
            <div class="flex flex-col items-center gap-6">
                <!-- Animated grid -->
                <div class="grid grid-cols-3 gap-1.5">
                    <span
                        v-for="i in 9" :key="i"
                        class="w-5 h-5 border-2 border-emerald-600 dark:border-emerald-400 animate-pulse"
                        :style="{ animationDelay: (i * 80) + 'ms' }"
                    />
                </div>
                <p class="uppercase tracking-widest text-sm font-bold text-emerald-700 dark:text-emerald-300">{{ t('quickPlay.generatingBoard') }}</p>
            </div>
        </div>
        <div class="grid lg:grid-cols-2 gap-4 lg:gap-16 w-full max-w-7xl">
            <div class="col-span-1">
                <div v-if="gameBoard" class="grid grid-rows-9 border-2 border-emerald-700 dark:border-emerald-300">
                    <div
                        class="row-span-1 grid grid-cols-9"
                        v-for="(board, index) in gameBoard"
                        :key="index"
                    >
                        <input
                            v-for="(cell, cellIndex) in board"
                            :key="cellIndex"
                            :class="[
                                {
                                    'border-r-2 border-r-emerald-700 dark:border-r-emerald-300': [2, 5].includes(cellIndex),
                                    'border-b-2 border-b-emerald-700 dark:border-b-emerald-300': [2, 5].includes(index),
                                    'text-red-500!': cellStatus[index]?.[cellIndex] === false,
                                    // 'bg-red-200/20': cell == 0,
                                    'bg-gray-400/90 dark:bg-gray-300/20':
                                        currentFocus &&
                                        (currentFocus.row === index || currentFocus.col === cellIndex),
                                    'bg-emerald-500! text-white!': cell === 0 && isCheckComplete,
                                },
                                'col-span-1 text-2xl sm:text-3xl lg:text-4xl aspect-square font-medium flex items-center border border-gray-300 dark:border-gray-500 justify-center text-center focus:outline-none',
                                'focus:caret-transparent cursor-pointer dark:focus:bg-gray-200 dark:focus:text-black focus:text-gray-300 focus:bg-slate-800/90',
                            ]"
                            :record="JSON.stringify({ row: index, col: cellIndex })"
                            @input="handleInput($event)"
                            @focus="handleFocus($event)"
                            @click="playSound('target')"
                            type="text"
                            maxlength="1"
                            :disabled="cell !== 0"
                            :value="cell !== 0 ? cell : playerBoard[index]?.[cellIndex] || ''"
                        />
                    </div>
                </div>
            </div>
            <div class="col-span-1">
                <div>
                    <h1 class="text-4xl uppercase font-semibold my-2">{{ t('quickPlay.battleInfo') }}</h1>
                    <div class="flex items-center gap-2">
                        <Counter 
                            progress 
                            theme="error" 
                            :title="t('quickPlay.currentWrong')" 
                            :count="inValidCount" 
                            :max="caninvalid" 
                        />
                        <Counter 
                            @mouseover="isCheckComplete = true" 
                            @mouseleave="isCheckComplete = false" 
                            progress 
                            theme="success" 
                            :title="t('quickPlay.currentProgress')" 
                            :count="Math.abs(countProgress - nullCells)" 
                            :max="nullCells"
                            class="cursor-pointer"
                        />
                    </div>
                </div>
                <Divider title="control" type="default" />
                <div class="flex flex-row gap-4 mt-4">
                    <Button class="uppercase font-medium" type="danger" @click="handlePopup">{{ t('quickPlay.newGame') }}</Button>
                    <Button class="uppercase font-medium" type="warning" @click="resetFocus">{{ t('quickPlay.clearAnswer') }}</Button>
                </div>
            </div>

            
        </div>
    </div>
</template>

<style scoped>
</style>