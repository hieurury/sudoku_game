import { defineStore } from 'pinia';
import { writeDataFile, readDataFile } from '../utils/dataStorage';

const STORAGE_KEY = 'sudoku_tower_progress';
const FILE_NAME = 'tower_progress.json';

export type TowerLevelType = 'time' | 'wrong';

export interface TowerLevelState {
  id: string;
  state: boolean; // completed
  type: TowerLevelType;
  null_cell: number;
  timer: number;
  unlock_condition: string[];
  board: number[][];
  game_board: number[][];
}

export interface TowerPlayProgress {
  levelId: string;
  playerBoard: number[][];
  invalidCount: number;
  timeRemaining: number; // for time type
  timestamp: number;
}

export interface TowerProgressState {
  completedLevels: Record<string, boolean>; // levelId -> completed
  lastPlayed: TowerPlayProgress | null;
  totalPlays: number;
  totalFailures: number;
  totalPlayTime: number; // seconds
}

const defaultState = (): TowerProgressState => ({
  completedLevels: {},
  lastPlayed: null,
  totalPlays: 0,
  totalFailures: 0,
  totalPlayTime: 0,
});

export const useTowerProgress = defineStore('towerProgress', {
  state: (): TowerProgressState => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as TowerProgressState;
      } catch {
        return defaultState();
      }
    }
    return defaultState();
  },

  actions: {
    _persist() {
      const data = {
        completedLevels: this.completedLevels,
        lastPlayed: this.lastPlayed,
        totalPlays: this.totalPlays,
        totalFailures: this.totalFailures,
        totalPlayTime: this.totalPlayTime,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // also persist to Tauri file
      writeDataFile(FILE_NAME, JSON.stringify(data)).catch(() => {});
    },

    async loadFromFile() {
      try {
        const content = await readDataFile(FILE_NAME);
        if (!content) return;
        const data = JSON.parse(content) as TowerProgressState;
        this.completedLevels = data.completedLevels ?? {};
        this.lastPlayed = data.lastPlayed ?? null;
        this.totalPlays = data.totalPlays ?? 0;
        this.totalFailures = data.totalFailures ?? 0;
        this.totalPlayTime = data.totalPlayTime ?? 0;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // file doesn't exist yet, use localStorage state
      }
    },

    markCompleted(levelId: string) {
      this.completedLevels[levelId] = true;
      this._persist();
    },

    saveLastPlayed(progress: TowerPlayProgress) {
      this.lastPlayed = progress;
      this._persist();
    },

    clearLastPlayed() {
      this.lastPlayed = null;
      this._persist();
    },

    incrementPlays() {
      this.totalPlays += 1;
      this._persist();
    },

    incrementFailures() {
      this.totalFailures += 1;
      this._persist();
    },

    addPlayTime(seconds: number) {
      this.totalPlayTime += seconds;
      this._persist();
    },

    isLevelUnlocked(level: TowerLevelState): boolean {
      if (!level.unlock_condition || level.unlock_condition.length === 0) return true;
      return level.unlock_condition.every((id) => this.completedLevels[id] === true);
    },

    isLevelCompleted(levelId: string): boolean {
      return this.completedLevels[levelId] === true;
    },
  },

  getters: {
    hasLastPlayed(): boolean {
      return this.lastPlayed !== null;
    },
    completedCount(): number {
      return Object.values(this.completedLevels).filter(Boolean).length;
    },
  },
});
