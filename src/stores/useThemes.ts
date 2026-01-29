import { defineStore } from 'pinia';

// type themeType = 'light' | 'dark';

export const useThemes = defineStore('themes', {
    state: () => ({
        theme: false as boolean,
    }),
    actions: {
        toggleTheme() {
            this.theme = !this.theme;
        }
    }
});