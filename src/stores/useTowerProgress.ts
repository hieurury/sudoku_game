import { defineStore } from 'pinia';
import { writeDataFile, readDataFile, isTauriRuntime } from '../utils/dataStorage';

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

function normalizeLevelId(levelId: string | number): string {
  const raw = String(levelId).trim();
  if (/^\d+$/.test(raw)) {
    return String(Number(raw)).padStart(3, '0');
  }
  return raw;
}

function normalizeCompletedLevels(
  completedLevels: Record<string, boolean> | undefined,
): Record<string, boolean> {
  if (!completedLevels) return {};

  const normalized: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(completedLevels)) {
    if (value !== true) continue;
    normalized[normalizeLevelId(key)] = true;
  }
  return normalized;
}

export const useTowerProgress = defineStore('towerProgress', {
  state: (): TowerProgressState => {
    if (isTauriRuntime()) {
      return defaultState();
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<TowerProgressState>;
        return {
          ...defaultState(),
          ...parsed,
          completedLevels: normalizeCompletedLevels(parsed.completedLevels),
          lastPlayed: parsed.lastPlayed ?? null,
        };
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
      if (isTauriRuntime()) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
      writeDataFile(FILE_NAME, JSON.stringify(data)).catch(() => {});
    },

    async loadFromFile() {
      if (!isTauriRuntime()) return;
      try {
        const content = await readDataFile(FILE_NAME);
        if (!content) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        const data = JSON.parse(content) as TowerProgressState;
        this.completedLevels = normalizeCompletedLevels(data.completedLevels);
        this.lastPlayed = data.lastPlayed ?? null;
        this.totalPlays = data.totalPlays ?? 0;
        this.totalFailures = data.totalFailures ?? 0;
        this.totalPlayTime = data.totalPlayTime ?? 0;
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    markCompleted(levelId: string) {
      this.completedLevels[normalizeLevelId(levelId)] = true;
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
      return level.unlock_condition.every(
        (id) => this.completedLevels[normalizeLevelId(id)] === true,
      );
    },

    isLevelCompleted(levelId: string): boolean {
      return this.completedLevels[normalizeLevelId(levelId)] === true;
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
