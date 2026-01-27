import {
  readTextFile,
  writeTextFile,
  remove,
  BaseDirectory
} from '@tauri-apps/plugin-fs';

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
}

export const useGameFile = () => {
  // Lưu trạng thái game
  const saveGame = async (state: GameFileState) => {
    const response: any = await writeTextFile(
      FILE_NAME,
      JSON.stringify(state),
      { baseDir: BaseDirectory.AppData }
    );
    if(response !instanceof Error) {
        console.log('Game saved successfully.');
    }
  };

  // Load trạng thái game
  const loadGame = async (): Promise<GameFileState | null> => {
    try {
      const content = await readTextFile(
        FILE_NAME,
        { baseDir: BaseDirectory.AppData }
      );
      return JSON.parse(content) as GameFileState;
    } catch {
      return null;
    }
  };

  // Xoá save
  const removeGame = async () => {
    try {
      await remove(
        FILE_NAME,
        { baseDir: BaseDirectory.AppData }
      );
    } catch {
      // file không tồn tại → bỏ qua
    }
  };

  return {
    saveGame,
    loadGame,
    removeGame
  };
};
