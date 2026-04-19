<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
//components
import Button from './Button.vue';
import Divider from './Divider.vue';
import { loadSound, playSound } from '../../utils/sound';


const { t } = useI18n();

onMounted(() => {
    loadSound('pop', '/sounds/pop.mp3');
});


const emit = defineEmits<{
    (e: 'positive'): void;
    (e: 'negative'): void;
}>();

const props = withDefaults(defineProps<{
    title?: string;
    description?: string;
    positiveLabel?: string;
    negativeLabel?: string;
    splitLayout?: boolean;
}>(), {
    splitLayout: false,
});

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
        :class="[
            'px-4 py-4 flex justify-center items-center flex-col dark:bg-slate-800 bg-white shadow-md border-2',
            props.splitLayout ? 'w-full max-w-4xl min-h-0' : 'min-w-lg min-h-64',
        ]"
        >
            <div
                v-if="props.splitLayout"
                class="w-full grid grid-cols-2 gap-2 items-center"
            >
                <div class="w-full flex justify-center">
                    <slot />
                </div>
                <div class="w-full flex flex-col justify-center items-center h-full">
                    <h3 class="text-3xl uppercase font-semibold text-center">{{ props.title }}</h3>
                    <p class="text-center mt-2">{{ props.description }}</p>
                    <Divider :title="t('common.action')" type="warning"/>
                    <div class="flex justify-center items-center gap-4">
                        <Button @click.stop="emit('positive')">{{ props.positiveLabel || t('more.yes') }}</Button>
                        <Button type="danger" @click.stop="emit('negative')">{{ props.negativeLabel || t('more.no') }}</Button>
                    </div>
                </div>
            </div>

            <template v-else>
                <h3 class="text-3xl uppercase font-semibold">{{ props.title }}</h3>
                <p class="w-7/10 text-center">{{ props.description }}</p>
                <div class="w-full mt-2" v-if="$slots.default">
                    <slot />
                </div>
                <Divider :title="t('common.action')" type="warning"/>
                <div class="flex justify-center items-center gap-4">
                    <Button @click.stop="emit('positive')">{{ props.positiveLabel || t('more.yes') }}</Button>
                    <Button type="danger" @click.stop="emit('negative')">{{ props.negativeLabel || t('more.no') }}</Button>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
</style>