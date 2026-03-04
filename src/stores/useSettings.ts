import { defineStore } from 'pinia';

export const useSettings = defineStore('settings', {
    state: () => ({
        soundEnabled: localStorage.getItem('sudoku_sound_enabled') !== 'false',
    }),
    actions: {
        toggleSound() {
            this.soundEnabled = !this.soundEnabled;
            localStorage.setItem('sudoku_sound_enabled', String(this.soundEnabled));
        },
        setSound(enabled: boolean) {
            this.soundEnabled = enabled;
            localStorage.setItem('sudoku_sound_enabled', String(enabled));
        }
    }
});
