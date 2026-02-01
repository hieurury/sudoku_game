<script setup lang="ts">
import { onMounted } from 'vue';
//components
import Button from './Button.vue';
import Divider from './Divider.vue';
import { loadSound, playSound } from '../../utils/sound';

onMounted(() => {
    loadSound('pop', '/sounds/pop.mp3');
});


const emit = defineEmits<{
    (e: 'positive'): void;
    (e: 'negative'): void;
}>();

defineProps<{
    title?: string;
    description?: string;
}>();

function voidClick() {
    playSound('pop');
    emit('negative')
}
   
</script>

<template>
    <div 
    @click="voidClick"
    class="fixed z-999 top-0 bottom-0 left-0 right-0 bg-slate-200/90 dark:bg-slate-700/90 flex justify-center items-center">
        <div
        @click.stop
        class="min-w-lg px-2 min-h-64 flex justify-center items-center flex-col dark:bg-slate-800 bg-white shadow-md border-2">
            <h3 class="text-3xl uppercase font-semibold">{{ title }}</h3>
            <p class="w-7/10 text-center">{{ description }}</p>
            <Divider title="action" type="warning"/>
            <div class="flex justify-center items-center gap-4">
                <Button @click.stop="emit('positive')">Yes</Button>
                <Button type="danger" @click.stop="emit('negative')">No</Button>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>