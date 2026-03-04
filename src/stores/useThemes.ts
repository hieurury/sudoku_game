import { defineStore } from 'pinia';

export const useThemes = defineStore('themes', {
    state: () => ({
        theme: localStorage.getItem('sudoku_theme') === 'dark',
    }),
    actions: {
        toggleTheme() {
            this.theme = !this.theme;
            localStorage.setItem('sudoku_theme', this.theme ? 'dark' : 'light');
        },
        setTheme(dark: boolean) {
            this.theme = dark;
            localStorage.setItem('sudoku_theme', dark ? 'dark' : 'light');
        }
    }
});