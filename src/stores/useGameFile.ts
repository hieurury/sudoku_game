import { writeDataFile, readDataFile, removeDataFile } from '../utils/dataStorage';

const FILE_NAME = 'game_save.json';

type Board = number[][];
type Status = boolean[][];

export interface GameFileState {
  _solutionBoard: Board;
  gameBoard: Board;
  playerBoard: Board;
  cellStatus: Status;
  canInvalid: number;
  invalidCount: number;
  gameDifficulty: 'easy' | 'medium' | 'hard';
}

export const useGameFile = () => {
  const saveGame = async (state: GameFileState) => {
    await writeDataFile(FILE_NAME, JSON.stringify(state));
  };

  const loadGame = async (): Promise<GameFileState | null> => {
    const content = await readDataFile(FILE_NAME);
    if (!content) return null;
    try {
      return JSON.parse(content) as GameFileState;
    } catch {
      return null;
    }
  };

  const removeGame = async () => {
    await removeDataFile(FILE_NAME);
  };

  return { saveGame, loadGame, removeGame };
};
