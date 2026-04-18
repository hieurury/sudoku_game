<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref, computed } from 'vue';
import { useGameStore } from '../stores/useGameState';
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
const popupTitle = ref<string>('');
const popupDescription = ref<string>('');
const popupPositive = ref<() => void>(() => {});
const popupNegative = ref<() => void>(() => {});
const popupPositiveLabel = ref<string | undefined>(undefined);
const popupNegativeLabel = ref<string | undefined>(undefined);
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
const quickDifficultyLabel = computed<string>(() => {
    if (isCustomMode.value) return t('home.modal.custom');
    if (gameDifficulty.value === 'medium') return t('home.modal.medium.title');
    if (gameDifficulty.value === 'hard') return t('home.modal.hard.title');
    return t('home.modal.easy.title');
});
const quickSessionTitle = computed<string>(() => {
    return t('quickPlay.sessionTitle', { difficulty: quickDifficultyLabel.value });
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
    isLoading.value = true;
    setTimeout(async () => {
        if (isCustomMode.value) {
            gameStore.newGameCustom(3, customNullCells.value);
        } else {
            await gameStore.initGame(3, gameDifficulty.value);
        }
        loadGameCounter();
        isLoading.value = false;
    }, 50);
    document.addEventListener('click', handleDocumentClick, true);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick, true);
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

function handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // If user clicks outside of a board input cell, remove current focus highlight.
    const cellInput = target.closest('input[record]');
    if (!cellInput) {
        gameStore.clearFocus();
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

function handleBlur() {
    gameStore.clearFocus();
}

function resetFocus() {
    gameStore.clearPlayerBoard();
    gameStore.clearFocus();
    loadGameCounter();
}

//lúc win
function handleWin() {
    gameStore.clearFocus();
    popupTitle.value = t('quickPlay.popup.congrats');
    popupDescription.value = t('quickPlay.popup.congratsDesc');
    popupPositive.value = newGame;
    popupPositiveLabel.value = t('quickPlay.newGame');
    popupNegative.value = () => {
        gameStore.resetGame(3, gameDifficulty.value);
        router.push('/');
    };
    popupNegativeLabel.value = t('quickPlay.exit');
    popupVisible.value = true;
    playSound('gameWin');
}

//lúc thua
function handleLose() {
    gameStore.clearFocus();
    popupTitle.value = t('quickPlay.popup.gameOver');
    popupDescription.value = t('quickPlay.popup.gameOverDesc');
    popupPositive.value = newGame;
    popupPositiveLabel.value = t('quickPlay.newGame');
    popupNegative.value = () => {
        gameStore.clearGameState();
        router.push('/');
    };
    popupNegativeLabel.value = t('quickPlay.exit');
    popupVisible.value = true;
    playSound('gameOver');
}

//hiện popup
function handlePopup() {
    popupTitle.value = t('quickPlay.popup.confirm');
    popupDescription.value = t('quickPlay.popup.confirmDesc');
    popupPositive.value = newGame;
    popupPositiveLabel.value = undefined;
    popupNegative.value = () => { popupVisible.value = false };
    popupNegativeLabel.value = undefined;
    popupVisible.value = true;
}

//thoát game
function handleExit() {
    popupTitle.value = t('quickPlay.popup.exit');
    popupDescription.value = t('quickPlay.popup.exitDesc');
    popupPositive.value = () => { router.push('/'); };
    popupPositiveLabel.value = undefined;
    popupNegative.value = () => { popupVisible.value = false; };
    popupNegativeLabel.value = undefined;
    popupVisible.value = true;
}

//tải số liệu trò chơi
function loadGameCounter() {
    inValidCount.value = gameStore.getInvalidCount;
    caninvalid.value = gameStore.getCanInvalid;
    countProgress.value = gameStore.getGameProgress;
    nullCells.value = gameStore.getGameNullCell;
}

function isInSameBox(row: number, col: number, focusRow: number, focusCol: number): boolean {
    return Math.floor(row / 3) === Math.floor(focusRow / 3)
        && Math.floor(col / 3) === Math.floor(focusCol / 3);
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
    :positive-label="popupPositiveLabel"
    :negative-label="popupNegativeLabel"
    @positive="popupPositive"
    @negative="popupNegative"
    />
    <SettingsModal v-if="settingsVisible" @close="settingsVisible = false" />
    <!-- Top-right action buttons -->
    <div class="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Button
            size="sm"
            type="danger"
            @click="handleExit"
            class="flex items-center gap-1 uppercase tracking-widest text-xs font-bold"
        >
            <Icon icon="material-symbols-light:logout-rounded" width="18" height="18" />
            <span class="hidden sm:inline">{{ t('quickPlay.exit') }}</span>
        </Button>
        <Button
            size="sm"
            @click="settingsVisible = true"
            class="flex items-center gap-1 uppercase tracking-widest text-xs font-bold"
        >
            <Icon icon="material-symbols-light:settings-rounded" width="18" height="18" />
            <span class="hidden sm:inline">{{ t('home.setting') }}</span>
        </Button>
    </div>
    <div class="min-h-screen flex flex-col pt-8 dark:bg-black/90 bg-white">
        <div class="flex-1 flex items-center justify-center p-6">
        <div class="grid grid-cols-2 gap-12 p-4 min-w-[820px]">
            <div class="col-span-1">
                <div class="w-7/8 mx-auto aspect-square relative">
                <!-- Real board (always in DOM) -->
                <div v-if="gameBoard" class="grid grid-rows-9 grid-cols-9 border-2 border-emerald-700 dark:border-emerald-300 w-full h-full">
                    <input
                        v-for="(cell, cellIndex) in gameBoard.flat()"
                        :key="cellIndex"
                        :class="[
                            {
                                'border-r-2 border-r-emerald-700 dark:border-r-emerald-300': [2, 5].includes(cellIndex % 9),
                                'border-b-2 border-b-emerald-700 dark:border-b-emerald-300': [2, 5].includes(Math.floor(cellIndex / 9)),
                                'text-red-500!': cellStatus[Math.floor(cellIndex / 9)]?.[cellIndex % 9] === false,
                                'bg-gray-400/90 dark:bg-gray-300/20':
                                    currentFocus &&
                                    (
                                        currentFocus.row === Math.floor(cellIndex / 9)
                                        || currentFocus.col === cellIndex % 9
                                        || isInSameBox(
                                            Math.floor(cellIndex / 9),
                                            cellIndex % 9,
                                            currentFocus.row,
                                            currentFocus.col,
                                        )
                                    ),
                                'bg-emerald-500! text-white!': cell === 0 && isCheckComplete,
                            },
                            'text-3xl font-medium flex items-center border border-gray-300 dark:border-gray-500 justify-center text-center focus:outline-none aspect-square w-full',
                            'focus:caret-transparent cursor-pointer dark:focus:bg-gray-200 dark:focus:text-black focus:text-gray-300 focus:bg-slate-800/90',
                        ]"
                        :record="JSON.stringify({ row: Math.floor(cellIndex / 9), col: cellIndex % 9 })"
                        @input="handleInput($event)"
                        @focus="handleFocus($event)"
                        @blur="handleBlur"
                        @click="playSound('target')"
                        type="text"
                        maxlength="1"
                        :disabled="cell !== 0"
                        :value="cell !== 0 ? cell : playerBoard[Math.floor(cellIndex / 9)]?.[cellIndex % 9] || ''"
                    />
                </div>
                <!-- Loading skeleton overlay (sits on top of real board) -->
                <div v-if="isLoading" class="absolute inset-0 grid grid-cols-9 grid-rows-9 border-2 border-emerald-700 dark:border-emerald-300">
                    <div
                        v-for="i in 81"
                        :key="i"
                        :class="[
                            {
                                'border-r-2 border-r-emerald-700 dark:border-r-emerald-300': [2, 5].includes((i - 1) % 9),
                                'border-b-2 border-b-emerald-700 dark:border-b-emerald-300': [2, 5].includes(Math.floor((i - 1) / 9)),
                            },
                            'border border-gray-300 dark:border-gray-500 animate-pulse',
                            i % 7 === 0 || i % 11 === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-gray-900',
                        ]"
                    />
                </div>
                </div>
            </div>
            <div class="col-span-1">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <span class="text-lg uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">
                            {{ quickSessionTitle }}
                        </span>
                    </div>
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
                <Divider :title="t('common.control')" type="default" />
                <div class="flex flex-row gap-4 mt-4">
                    <Button class="uppercase font-medium" type="danger" @click="handlePopup">{{ t('quickPlay.newGame') }}</Button>
                    <Button class="uppercase font-medium" type="warning" @click="resetFocus">{{ t('quickPlay.clearAnswer') }}</Button>
                </div>

                
            </div>
        </div>
        </div>
    </div>
</template>

<style scoped>
</style>