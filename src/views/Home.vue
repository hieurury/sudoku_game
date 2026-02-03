<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { useRouter } from 'vue-router';
    //components
    import Button from '../components/ui/Button.vue';
    import Modal from '../components/ui/Modal.vue';
    import Card from '../components/ui/Card.vue';

    const router = useRouter();

    const modalVisible = ref(false);


    const quickPlayTitle = computed(() => {
        return localStorage.getItem('sudoku_game_state') ? 'Continue Game' : 'Quick Play';
    })
</script>

<template>
    <div class="w-full min-h-screen flex flex-col space-y-4 justify-center items-center dark:bg-black/90 bg-white">
        <h1 class="text-5xl uppercase font-semibold dark:text-gray-300 tracking-wider">SUDOKU GAME</h1>
        <div class="flex justify-center items-center flex-col">
            <Button 
            @click="() => modalVisible = true"
            >{{ quickPlayTitle }}</Button>
        </div>
        <Modal
        v-if="modalVisible"
        title="Select Difficulty"
        >
            <Card title="Easy"
            description="Dễ chơi, dễ trúng thưởng"
            :rate="1"
            @click="() => {
                modalVisible = false;
                router.push('/quick-play?difficulty=easy');
            }"
            />
            <Card title="Medium"
            description="Trung bình, thử thách hơn"
            :rate="3"
            theme="warning"
            @click="() => {
                modalVisible = false;
                router.push('/quick-play?difficulty=medium');
            }"
            />
            <Card title="Hard"
            description="Khó, dành cho người chơi kinh nghiệm"
            :rate="5"
            theme="error"
            @click="() => {
                modalVisible = false;
                router.push('/quick-play?difficulty=hard');
            }"
            />
        </Modal>
    </div>
</template>

<style scoped>
</style>