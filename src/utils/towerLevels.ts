import type { TowerLevelState } from '../stores/useTowerProgress';

type TowerLevelModule = { default: TowerLevelState };

const towerLevelModules = import.meta.glob<TowerLevelModule>('../data/game/game_*.json');

function extractLevelNumberFromPath(path: string): number | null {
  const match = path.match(/game_(\d+)\.json$/);
  if (!match) return null;

  const levelPart = match[1];
  if (!levelPart) return null;

  const levelNumber = Number.parseInt(levelPart, 10);
  return Number.isFinite(levelNumber) && levelNumber > 0 ? levelNumber : null;
}

export function toTowerLevelNumber(levelId: string | number): number | null {
  const levelNumber = Number.parseInt(String(levelId), 10);
  if (!Number.isFinite(levelNumber) || levelNumber <= 0) return null;
  return levelNumber;
}

export function getTowerLevelCount(): number {
  return Object.keys(towerLevelModules).length;
}

export async function loadTowerLevels(): Promise<TowerLevelState[]> {
  const entries = Object.entries(towerLevelModules)
    .map(([path, loader]) => ({
      path,
      loader,
      levelNumber: extractLevelNumberFromPath(path),
    }))
    .filter((entry): entry is { path: string; loader: () => Promise<TowerLevelModule>; levelNumber: number } => (
      entry.levelNumber !== null
    ))
    .sort((a, b) => a.levelNumber - b.levelNumber);

  const modules = await Promise.all(entries.map((entry) => entry.loader()));
  return modules.map((module) => module.default);
}

export async function loadTowerLevelById(levelId: string | number): Promise<TowerLevelState> {
  const levelNumber = toTowerLevelNumber(levelId);
  if (levelNumber === null) {
    throw new Error(`Invalid tower level id: ${levelId}`);
  }

  const path = `../data/game/game_${levelNumber}.json`;
  const loader = towerLevelModules[path];
  if (!loader) {
    throw new Error(`Tower level data not found for id: ${levelId}`);
  }

  const module = await loader();
  return module.default;
}
