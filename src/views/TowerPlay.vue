<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import { loadSound, playSound } from '../utils/sound';
import { useTowerProgress } from '../stores/useTowerProgress';
import type { TowerLevelState, TowerPlayProgress } from '../stores/useTowerProgress';
import { loadTowerLevelById, toTowerLevelNumber, getTowerLevelCount } from '../utils/towerLevels';

// components
import Counter from '../components/ui/Counter.vue';
import Button from '../components/ui/Button.vue';
import Divider from '../components/ui/Divider.vue';
import Popup from '../components/ui/Popup.vue';
import SettingsModal from '../components/partials/SettingsModal.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const towerProgress = useTowerProgress();

function normalizeRouteLevelId(raw: string | number): string {
    const levelNum = toTowerLevelNumber(raw);
    return levelNum === null ? String(raw) : String(levelNum);
}

const totalTowerLevels = getTowerLevelCount();
const levelId = computed(() => normalizeRouteLevelId(String(route.params.levelId ?? '1')));
const levelData = ref<TowerLevelState | null>(null);

// Board state (separate from QuickPlay to avoid conflict)
const boardSize = 9;
type Board = number[][];
const solutionBoard = ref<Board>(Array.from({ length: boardSize }, () => Array(boardSize).fill(0)));
const gameBoard = ref<Board>(Array.from({ length: boardSize }, () => Array(boardSize).fill(0)));
const playerBoard = ref<Board>(Array.from({ length: boardSize }, () => Array(boardSize).fill(0)));
const boardCellStatus = ref<boolean[][]>(Array.from({ length: boardSize }, () => Array(boardSize).fill(true)));
const currentFocusLocal = ref<{ row: number; col: number } | null>(null);

// Game counters
const invalidCount = ref(0);
const canInvalid = ref(3);
const countProgress = ref(0);
const nullCells = ref(0);
const isLoading = ref(false);
const isCheckComplete = ref(false);

// Timer (for type=time)
const timeRemaining = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;
const isTimeMode = computed(() => levelData.value?.type === 'time');
const timerDisplay = computed(() => {
    const m = Math.floor(timeRemaining.value / 60);
    const s = timeRemaining.value % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

// Popup
const popupVisible = ref(false);
const popupTitle = ref('');
const popupDescription = ref('');
const popupPositive = ref<() => void>(() => {});
const popupNegative = ref<() => void>(() => {});
const popupPositiveLabel = ref<string | undefined>(undefined);
const popupNegativeLabel = ref<string | undefined>(undefined);

// Settings
const settingsVisible = ref(false);
const gameSessionStart = ref(Date.now());

// ─── helpers ──────────────────────────────────────────────────────────────────

function updateBoardStatus() {
    boardCellStatus.value = Array.from({ length: boardSize }, () => Array(boardSize).fill(true));
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const val = playerBoard.value[i]![j];
            if (!val) continue;
            if (solutionBoard.value[i]![j] !== val) {
                boardCellStatus.value[i]![j] = false;
                continue;
            }
            for (let c = 0; c < boardSize; c++) {
                if (c !== j && playerBoard.value[i]![c] === val) {
                    boardCellStatus.value[i]![j] = false;
                    boardCellStatus.value[i]![c] = false;
                }
            }
            for (let r = 0; r < boardSize; r++) {
                if (r !== i && playerBoard.value[r]![j] === val) {
                    boardCellStatus.value[i]![j] = false;
                    boardCellStatus.value[r]![j] = false;
                }
            }
            const sr = Math.floor(i / 3) * 3;
            const sc = Math.floor(j / 3) * 3;
            for (let r = sr; r < sr + 3; r++) {
                for (let c = sc; c < sc + 3; c++) {
                    if ((r !== i || c !== j) && playerBoard.value[r]![c] === val) {
                        boardCellStatus.value[i]![j] = false;
                        boardCellStatus.value[r]![c] = false;
                    }
                }
            }
        }
    }
}

function isWin(): boolean {
    for (let i = 0; i < boardSize; i++)
        for (let j = 0; j < boardSize; j++)
            if (playerBoard.value[i]![j] !== solutionBoard.value[i]![j]) return false;
    return true;
}

function isLose(): boolean {
    return invalidCount.value >= canInvalid.value;
}

function loadGameCounters() {
    let wrong = 0;
    let progress = 0;
    let total = 0;
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const expected = solutionBoard.value[i]![j];
            const played = playerBoard.value[i]![j];
            if (gameBoard.value[i]![j] === 0) {
                total++;
                if (played !== 0 && played === expected) progress++;
            }
        }
    }
    nullCells.value = total;
    countProgress.value = progress;
    invalidCount.value = wrong;
}

function saveProgress() {
    if (!levelData.value) return;
    const progress: TowerPlayProgress = {
        levelId: levelId.value,
        playerBoard: playerBoard.value.map(r => [...r]),
        invalidCount: invalidCount.value,
        timeRemaining: timeRemaining.value,
        timestamp: Date.now(),
    };
    towerProgress.saveLastPlayed(progress);
}

// ─── timer ────────────────────────────────────────────────────────────────────

function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
        if (timeRemaining.value > 0) {
            timeRemaining.value--;
            if (timeRemaining.value === 0) {
                stopTimer();
                handleLose();
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ─── load level ───────────────────────────────────────────────────────────────

async function loadLevel(resumeProgress?: TowerPlayProgress) {
    isLoading.value = true;
    stopTimer();
    try {
        const data = await loadTowerLevelById(levelId.value);
        levelData.value = data;

        solutionBoard.value = data.board.map(r => [...r]);
        gameBoard.value = data.game_board.map(r => [...r]);

        if (resumeProgress) {
            playerBoard.value = resumeProgress.playerBoard.map(r => [...r]);
            invalidCount.value = resumeProgress.invalidCount;
            timeRemaining.value = resumeProgress.timeRemaining;
        } else {
            playerBoard.value = data.game_board.map(r => [...r]);
            invalidCount.value = 0;
            timeRemaining.value = data.timer;
        }

        canInvalid.value = 3;
        boardCellStatus.value = Array.from({ length: boardSize }, () => Array(boardSize).fill(true));

        // count null cells
        let total = 0;
        for (let i = 0; i < boardSize; i++)
            for (let j = 0; j < boardSize; j++)
                if (data.game_board[i]![j] === 0) total++;
        nullCells.value = total;

        updateBoardStatus();
        loadGameCounters();
        gameSessionStart.value = Date.now();
        towerProgress.incrementPlays();

        if (isTimeMode.value && timeRemaining.value > 0) {
            startTimer();
        }
    } finally {
        isLoading.value = false;
    }
}

// ─── event handlers ───────────────────────────────────────────────────────────

function handleInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    const record = target.getAttribute('record');
    if (!record) return;
    const { row, col } = JSON.parse(record) as { row: number; col: number };
    const value = Number(target.value) || 0;

    playerBoard.value[row]![col] = value;

    if (value !== 0 && solutionBoard.value[row]![col] !== value) {
        invalidCount.value++;
    }

    updateBoardStatus();

    // refresh counter
    let progress = 0;
    for (let i = 0; i < boardSize; i++)
        for (let j = 0; j < boardSize; j++)
            if (gameBoard.value[i]![j] === 0 && playerBoard.value[i]![j] === solutionBoard.value[i]![j])
                progress++;
    countProgress.value = progress;

    saveProgress();

    if (isWin()) handleWin();
    else if (isLose()) handleLose();
}

function handleFocus(e: FocusEvent) {
    const target = e.target as HTMLInputElement;
    const record = target.getAttribute('record');
    if (record) currentFocusLocal.value = JSON.parse(record);
}

function handleFocusOut() {
    currentFocusLocal.value = null;
}

function isInSameBox(row: number, col: number, focusRow: number, focusCol: number): boolean {
    return Math.floor(row / 3) === Math.floor(focusRow / 3)
        && Math.floor(col / 3) === Math.floor(focusCol / 3);
}

function clearAnswers() {
    playerBoard.value = gameBoard.value.map(r => [...r]);
    invalidCount.value = 0;
    countProgress.value = 0;
    updateBoardStatus();
    saveProgress();
}

function handleWin() {
    stopTimer();
    towerProgress.markCompleted(levelId.value);
    const elapsed = Math.round((Date.now() - gameSessionStart.value) / 1000);
    towerProgress.addPlayTime(elapsed);
    towerProgress.clearLastPlayed();
    playSound('gameWin');

    popupTitle.value = t('towerPlay.popup.congrats');
    popupDescription.value = t('towerPlay.popup.congratsDesc');
    popupPositiveLabel.value = t('home.continueGame');
    popupPositive.value = () => {
        popupVisible.value = false;
        const next = Number(levelId.value) + 1;
        if (next <= totalTowerLevels) {
            router.push(`/tower-play/${next}`);
            return;
        }
        router.push('/');
    };
    popupNegative.value = () => router.push('/');
    popupNegativeLabel.value = t('quickPlay.exit');
    popupVisible.value = true;
}

function handleLose() {
    stopTimer();
    towerProgress.incrementFailures();
    const elapsed = Math.round((Date.now() - gameSessionStart.value) / 1000);
    towerProgress.addPlayTime(elapsed);
    playSound('gameOver');

    popupTitle.value = t('towerPlay.popup.gameOver');
    popupDescription.value = isTimeMode.value
        ? t('towerPlay.popup.timeOutDesc')
        : t('towerPlay.popup.gameOverDesc');
    popupPositiveLabel.value = t('towerPlay.retry');
    popupPositive.value = () => {
        popupVisible.value = false;
        loadLevel();
    };
    popupNegative.value = () => {
        towerProgress.clearLastPlayed();
        router.push('/');
    };
    popupNegativeLabel.value = t('quickPlay.exit');
    popupVisible.value = true;
}

function handleExit() {
    stopTimer();
    const elapsed = Math.round((Date.now() - gameSessionStart.value) / 1000);
    towerProgress.addPlayTime(elapsed);
    saveProgress();
    popupTitle.value = t('towerPlay.popup.exit');
    popupDescription.value = t('towerPlay.popup.exitDesc');
    popupPositive.value = () => router.push('/');
    popupPositiveLabel.value = undefined;
    popupNegative.value = () => {
        popupVisible.value = false;
        gameSessionStart.value = Date.now();
        if (isTimeMode.value && timeRemaining.value > 0) startTimer();
    };
    popupNegativeLabel.value = undefined;
    popupVisible.value = true;
}

function handleNewLevel() {
    stopTimer();
    towerProgress.clearLastPlayed();
    loadLevel();
}

// ─── lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
    loadSound('target', '/sounds/target.mp3');
    loadSound('gameOver', '/sounds/game_over.mp3');
    loadSound('gameWin', '/sounds/game_win.mp3');
    await towerProgress.loadFromFile();

    // check if resuming same level
    const lp = towerProgress.lastPlayed;
    const shouldResume = lp && normalizeRouteLevelId(lp.levelId) === levelId.value;
    try {
        await loadLevel(shouldResume ? lp : undefined);
    } catch (error) {
        console.error('Failed to load tower level', levelId.value, error);
        towerProgress.clearLastPlayed();
        router.push('/');
    }
});

watch(levelId, async (nextLevelId, prevLevelId) => {
    if (nextLevelId === prevLevelId) return;
    popupVisible.value = false;
    const lp = towerProgress.lastPlayed;
    const shouldResume = lp && normalizeRouteLevelId(lp.levelId) === nextLevelId;
    try {
        await loadLevel(shouldResume ? lp : undefined);
    } catch (error) {
        console.error('Failed to load tower level', nextLevelId, error);
        towerProgress.clearLastPlayed();
        router.push('/');
    }
});

onUnmounted(() => {
    stopTimer();
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

    <!-- Top-right controls -->
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

                <!-- Board -->
                <div class="col-span-1">
                    <div class="w-7/8 mx-auto aspect-square relative">
                        <div v-if="gameBoard" class="grid grid-rows-9 grid-cols-9 border-2 border-emerald-700 dark:border-emerald-300 w-full h-full">
                            <input
                                v-for="(cell, cellIndex) in gameBoard.flat()"
                                :key="cellIndex"
                                :class="[
                                    {
                                        'border-r-2 border-r-emerald-700 dark:border-r-emerald-300': [2,5].includes(cellIndex % 9),
                                        'border-b-2 border-b-emerald-700 dark:border-b-emerald-300': [2,5].includes(Math.floor(cellIndex / 9)),
                                        'text-red-500!': boardCellStatus[Math.floor(cellIndex / 9)]?.[cellIndex % 9] === false,
                                        'bg-gray-400/90 dark:bg-gray-300/20':
                                            currentFocusLocal &&
                                            (
                                                currentFocusLocal.row === Math.floor(cellIndex / 9)
                                                || currentFocusLocal.col === cellIndex % 9
                                                || isInSameBox(
                                                    Math.floor(cellIndex / 9),
                                                    cellIndex % 9,
                                                    currentFocusLocal.row,
                                                    currentFocusLocal.col,
                                                )
                                            ),
                                        'bg-emerald-500! text-white!': cell === 0 && isCheckComplete,
                                    },
                                    'text-3xl font-medium flex items-center border border-gray-300 dark:border-gray-500 justify-center text-center focus:outline-none aspect-square w-full',
                                    'focus:caret-transparent cursor-pointer dark:focus:bg-gray-200 dark:focus:text-black focus:text-gray-300 focus:bg-slate-800/90',
                                ]"
                                :record="JSON.stringify({ row: Math.floor(cellIndex / 9), col: cellIndex % 9 })"
                                @input="handleInput($event as InputEvent)"
                                @focus="handleFocus($event)"
                                @focusout="handleFocusOut"
                                @click="playSound('target')"
                                type="text"
                                maxlength="1"
                                :disabled="cell !== 0"
                                :value="cell !== 0 ? cell : (playerBoard[Math.floor(cellIndex / 9)]?.[cellIndex % 9] || '')"
                            />
                        </div>
                        <!-- loading skeleton -->
                        <div v-if="isLoading" class="absolute inset-0 grid grid-cols-9 grid-rows-9 border-2 border-emerald-700 dark:border-emerald-300">
                            <div
                                v-for="i in 81"
                                :key="i"
                                :class="[
                                    {
                                        'border-r-2 border-r-emerald-700 dark:border-r-emerald-300': [2,5].includes((i-1) % 9),
                                        'border-b-2 border-b-emerald-700 dark:border-b-emerald-300': [2,5].includes(Math.floor((i-1) / 9)),
                                    },
                                    'border border-gray-300 dark:border-gray-500 animate-pulse',
                                    i % 7 === 0 || i % 11 === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-gray-900',
                                ]"
                            />
                        </div>
                    </div>
                </div>

                <!-- Info panel -->
                <div class="col-span-1">
                    <!-- Level badge -->
                    <div class="flex items-center gap-3 mb-2">
                        <span class="text-lg uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">
                            {{ t('towerPlay.sessionTitle') }} {{ levelId }}
                        </span>
                        <span v-if="isTimeMode" class="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest">
                            {{ t('towerPlay.timeMode') }}
                        </span>
                    </div>

                    <h1 class="text-4xl uppercase font-semibold my-2">{{ t('quickPlay.battleInfo') }}</h1>

                    <div class="flex items-center gap-2">
                        <!-- Timer counter (time mode) -->
                        <Counter
                            v-if="isTimeMode"
                            progress
                            theme="info"
                            :title="t('towerPlay.timeLeft')"
                            :count="timeRemaining"
                            :max="levelData?.timer ?? 60"
                        />
                        <!-- Wrong count (wrong mode) -->
                        <Counter
                            v-else
                            progress
                            theme="error"
                            :title="t('quickPlay.currentWrong')"
                            :count="invalidCount"
                            :max="canInvalid"
                        />
                        <!-- Progress counter -->
                        <Counter
                            @mouseover="isCheckComplete = true"
                            @mouseleave="isCheckComplete = false"
                            progress
                            theme="success"
                            :title="t('quickPlay.currentProgress')"
                            :count="countProgress"
                            :max="nullCells"
                            class="cursor-pointer"
                        />
                    </div>

                    <!-- Timer display for time mode -->
                    <div v-if="isTimeMode" class="mt-3 flex items-center gap-2">
                        <Icon icon="material-symbols-light:timer-outline" width="24" height="24" class="dark:text-white" />
                        <span
                            class="text-4xl font-mono font-bold tabular-nums"
                            :class="timeRemaining <= 30 ? 'text-red-500 animate-pulse' : 'dark:text-white'"
                        >{{ timerDisplay }}</span>
                    </div>

                    <Divider :title="t('common.control')" type="default" />

                    <div class="flex flex-row gap-4 mt-4">
                        <Button class="uppercase font-medium" type="danger" @click="handleNewLevel">
                            {{ t('towerPlay.retry') }}
                        </Button>
                        <Button class="uppercase font-medium" type="warning" @click="clearAnswers">
                            {{ t('quickPlay.clearAnswer') }}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
</style>
