import { defineStore } from 'pinia';
import { writeDataFile, readDataFile } from '../utils/dataStorage';

const FILE_NAME = 'settings.json';

export const useSettings = defineStore('settings', {
    state: () => ({
        soundEnabled: localStorage.getItem('sudoku_sound_enabled') !== 'false',
    }),
    actions: {
        _persistToFile() {
            writeDataFile(
                FILE_NAME,
                JSON.stringify({ soundEnabled: this.soundEnabled })
            ).catch(() => {});
        },
        async loadFromFile() {
            const content = await readDataFile(FILE_NAME);
            if (!content) return;
            try {
                const data = JSON.parse(content);
                if (typeof data.soundEnabled === 'boolean') {
                    this.soundEnabled = data.soundEnabled;
                    localStorage.setItem('sudoku_sound_enabled', String(data.soundEnabled));
                }
            } catch { /* ignore */ }
        },
        toggleSound() {
            this.soundEnabled = !this.soundEnabled;
            localStorage.setItem('sudoku_sound_enabled', String(this.soundEnabled));
            this._persistToFile();
        },
        setSound(enabled: boolean) {
            this.soundEnabled = enabled;
            localStorage.setItem('sudoku_sound_enabled', String(enabled));
            this._persistToFile();
        }
    }
});
