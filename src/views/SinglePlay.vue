<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';
import { useGameStore } from '../stores/useGameState';
import { useGameFile } from '../stores/useGameFile';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { loadSound, playSound } from '../utils/sound';

//components
import Counter from '../components/ui/Counter.vue';
import Button from '../components/ui/Button.vue';
import Divider from '../components/ui/Divider.vue';
import Popup from '../components/ui/Popup.vue';

const gameStore = useGameStore();
const gameFile = useGameFile();
const { gameBoard, playerBoard, currentFocus, cellStatus } = storeToRefs(gameStore);
const router = useRouter();


// const isWin = ref<boolean>(false);
const caninvalid = ref<number>(0);
const inValidCount = ref<number>(0);
const countProgress = ref<number>(0);
const isCheckComplete = ref<boolean>(false);
//popup control
const popupVisible = ref<boolean>(false);
const popupTitle = ref<string>('Title');
const popupDescription = ref<string>('Description');
const popupPositive = ref<() => void>(() => {});
const popupNegative = ref<() => void>(() => {});
//game settings
const nullCells = 10;

onMounted(() => {
    loadSound('target', '/sounds/target.mp3');
    loadSound('gameOver', '/sounds/game_over.mp3');
    loadSound('gameWin', '/sounds/game_win.mp3');
    gameStore.initGame();
    //nhận giá trị valid từ store
    loadGameCounter();
});

function newGame() {
    resetFocus();
    gameStore.resetGame(nullCells);
    loadGameCounter();

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
    popupTitle.value = 'CONGRATULATIONS!';
    popupDescription.value = 'Do yout want to play new game?';
    popupPositive.value = newGame;
    popupNegative.value = () => {
        gameStore.resetGame(nullCells);
        router.push('/');
    };
    popupVisible.value = true;
    playSound('gameWin');
}

//lúc thua
function handleLose() {
    popupTitle.value = 'GAME OVER!';
    popupDescription.value = 'You have exceeded the maximum number of wrong moves. Do you want to play new game?';
    popupPositive.value = newGame;
    popupNegative.value = () => {
        gameStore.resetGame(nullCells);
        router.push('/');
    };
    popupVisible.value = true;
    playSound('gameOver');
}

//hiện popup
function handlePopup() {
    popupTitle.value = 'Are you sure?';
    popupDescription.value = 'This action will reset your current progress.';
    popupPositive.value = newGame;
    popupNegative.value = () => { popupVisible.value = false };
    popupVisible.value = true;
}

//tải số liệu trò chơi
function loadGameCounter() {
    inValidCount.value = gameStore.getInvalidCount;
    caninvalid.value = gameStore.getCanInvalid;
    countProgress.value = gameStore.getGameProgress;
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
    <div class="grid lg:grid-cols-2 gap-4 p-4">
        <div class="col-span-1 lg:px-24">
            <div v-if="gameBoard" class="grid grid-rows-9 border-2 border-emerald-700">
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
                                'border-r-2 border-r-emerald-700': [2, 5].includes(cellIndex),
                                'border-b-2 border-b-emerald-700': [2, 5].includes(index),
                                'text-red-500': cellStatus[index]?.[cellIndex] === false,
                                // 'bg-red-200/20': cell == 0,
                                'bg-gray-400/90 dark:bg-gray-300/20':
                                    currentFocus &&
                                    (currentFocus.row === index || currentFocus.col === cellIndex),
                                'bg-emerald-500! text-white!': cell === 0 && isCheckComplete,
                            },
                            'col-span-1 lg:text-4xl text-3xl lg:h-14 font-medium flex items-center border border-gray-300 justify-center text-center focus:outline-none',
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
                <h1 class="text-4xl uppercase font-semibold my-2">Battle information</h1>
                <div class="flex items-center gap-2">
                    <Counter 
                        progress 
                        theme="error" 
                        title="Current wrong" 
                        :count="inValidCount" 
                        :max="caninvalid" 
                    />
                    <Counter 
                        @mouseover="isCheckComplete = true" 
                        @mouseleave="isCheckComplete = false" 
                        progress 
                        theme="success" 
                        title="Current progress" 
                        :count="Math.abs(countProgress - nullCells)" 
                        :max="nullCells"
                        class="cursor-pointer"
                    />
                </div>
            </div>
            <Divider title="control" type="default" />
            <div class="flex flex-row gap-4 mt-4">
                <Button class="uppercase font-medium" type="danger" @click="handlePopup">New game</Button>
                <Button class="uppercase font-medium" type="warning" @click="resetFocus">Clear answer</Button>
            </div>
        </div>

        
    </div>
</template>

<style scoped>
</style>