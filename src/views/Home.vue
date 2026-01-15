<script setup lang="ts">
    import { useRouter } from 'vue-router';
    //components
    import Button from '../components/ui/Button.vue';

    const router = useRouter();
    function goToSinglePlay() {
        router.push('/single-play');
    }
</script>

<template>
    <div class="w-full min-h-screen flex flex-col space-y-4 justify-center items-center dark:bg-black/90 bg-white">
        <h1 class="text-5xl uppercase font-semibold dark:text-gray-300 tracking-wider">SUDOKU GAME</h1>
        <div class="flex justify-center items-center flex-col">
            <Button 
            @click="goToSinglePlay"
            >Single play</Button>
        </div>
    </div>
</template>

<style scoped>
</style>