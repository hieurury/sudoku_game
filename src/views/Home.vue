<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { Icon } from '@iconify/vue';
    import { useI18n } from 'vue-i18n';
    //components
    import Button from '../components/ui/Button.vue';
    import Modal from '../components/ui/Modal.vue';
    import Card from '../components/ui/Card.vue';
    import SettingsModal from '../components/partials/SettingsModal.vue';

    const { t } = useI18n();

    const router = useRouter();

    const modalVisible = ref(false);
    const settingsVisible = ref(false);
    const showCustomPanel = ref(false);
    const customNullCells = ref(35);

    const customDifficultyInfo = computed(() => {
        const n = customNullCells.value;
        if (n <= 25) return { label: 'EASY', color: 'text-emerald-500', bar: 'bg-emerald-500', pct: Math.round((n / 50) * 100) };
        if (n <= 40) return { label: 'MEDIUM', color: 'text-yellow-500', bar: 'bg-yellow-500', pct: Math.round((n / 50) * 100) };
        return { label: 'HARD', color: 'text-red-500', bar: 'bg-red-500', pct: Math.round((n / 50) * 100) };
    });

    const gameDifficulty = computed(() => {
        const gameState = localStorage.getItem('sudoku_game_state');
        if (!gameState) return null;
        return JSON.parse(gameState).gameDifficulty;
    });
    const continueGameBtn = computed(() => {
        return !!localStorage.getItem('sudoku_game_state');
    });

    function startNewGame() {
        localStorage.removeItem('sudoku_game_state');
        showCustomPanel.value = false;
        modalVisible.value = true;
    }
    function continueGame() {
        if (gameDifficulty.value) {
            router.push(`/quick-play?difficulty=${gameDifficulty.value}`);
        }
    }
    function startCustomGame() {
        modalVisible.value = false;
        showCustomPanel.value = false;
        router.push(`/quick-play?difficulty=custom&nullCells=${customNullCells.value}`);
    }
</script>

<template>
    <div class="w-full min-h-screen flex flex-col space-y-4 justify-center items-center dark:bg-black/90 bg-white">
        <h1 class="text-7xl uppercase font-semibold dark:text-gray-300 tracking-wider">{{ t('home.title') }}</h1>
        <div class="flex justify-center items-center flex-col">
            <div class="flex flex-col gap-2">
                <Button 
                v-if="continueGameBtn"
                @click="continueGame"
                >Continue game</Button>
                <Button
                class="w-64 text-2xl flex items-center justify-center"
                type="danger"
                @click="startNewGame"
                >
                <Icon icon="material-symbols-light:play-arrow-rounded" width="32" height="32" />
                <h3>{{ t('home.newGame') }}</h3>
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
    </div>
</template>

<style scoped>
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