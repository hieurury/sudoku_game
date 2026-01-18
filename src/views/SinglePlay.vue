<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';
import { useGameStore } from '../stores/useGameState';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';

const gameStore = useGameStore();
const { gameBoard, playerBoard, currentFocus, cellStatus } = storeToRefs(gameStore);


const isWin = ref(false);

onMounted(() => {
    gameStore.initGame();
});

function handleInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    const record = target.getAttribute('record');
    if (record) {
        const data = JSON.parse(record);
        const value = Number(target.value) || 0;
        gameStore.updateCell(data.row, data.col, value);
    }
    // Check win condition
    if (gameStore.isWin()) {
        handleWin();
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
    gameStore.clearFocus();
}

function handleWin() {
    Swal.fire({
        title: 'Chúc mừng!',
        text: 'Bạn đã chiến thắng! Chơi lại không?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Chơi lại',
        cancelButtonText: 'Thoát'
    }).then((result) => {
        if (result.isConfirmed) {
            resetFocus();
            gameStore.resetGame(2);
        }
    }); 
}

// function handleValidate(currentFocus: object): boolean {
//     const currentRow = (currentFocus as any).row;
//     const currentCol = (currentFocus as any).col;
//     const currentData = game
// }

watch(currentFocus, (newVal) => {
    console.log('Current Focus Changed:', newVal);
});
</script>

<template>
    <div class="flex flex-col justify-center items-center gap-4">
        <button
            @click="gameStore.resetGame(2)"
            class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
            New Game
        </button>

        <div v-if="gameBoard" class="grid grid-rows-9 border-2 border-emerald-700">
            <span
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
                            'bg-gray-300/20':
                                currentFocus &&
                                (currentFocus.row === index || currentFocus.col === cellIndex),
                        },
                        'col-span-1 text-4xl w-16 h-16 flex items-center border border-gray-300 justify-center text-center focus:outline-none',
                        'focus:caret-transparent cursor-pointer focus:bg-gray-200',
                    ]"
                    :record="JSON.stringify({ row: index, col: cellIndex })"
                    @input="handleInput($event)"
                    @focus="handleFocus($event)"
                    type="text"
                    maxlength="1"
                    :disabled="cell !== 0"
                    :value="cell !== 0 ? cell : playerBoard[index]?.[cellIndex] || ''"
                />
            </span>
        </div>
    </div>
</template>

<style scoped>
</style>