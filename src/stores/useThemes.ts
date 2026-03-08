import { defineStore } from 'pinia';
import { writeDataFile, readDataFile } from '../utils/dataStorage';

const FILE_NAME = 'themes.json';

export const useThemes = defineStore('themes', {
    state: () => ({
        theme: localStorage.getItem('sudoku_theme') === 'dark',
    }),
    actions: {
        _persistToFile() {
            writeDataFile(
                FILE_NAME,
                JSON.stringify({ theme: this.theme })
            ).catch(() => {});
        },
        async loadFromFile() {
            const content = await readDataFile(FILE_NAME);
            if (!content) return;
            try {
                const data = JSON.parse(content);
                if (typeof data.theme === 'boolean') {
                    this.theme = data.theme;
                    localStorage.setItem('sudoku_theme', data.theme ? 'dark' : 'light');
                }
            } catch { /* ignore */ }
        },
        toggleTheme() {
            this.theme = !this.theme;
            localStorage.setItem('sudoku_theme', this.theme ? 'dark' : 'light');
            this._persistToFile();
        },
        setTheme(dark: boolean) {
            this.theme = dark;
            localStorage.setItem('sudoku_theme', dark ? 'dark' : 'light');
            this._persistToFile();
        }
    }
});