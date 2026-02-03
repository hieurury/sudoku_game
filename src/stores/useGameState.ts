import { defineStore } from 'pinia';
import { useGameFile } from './useGameFile';

const gameFile = useGameFile();

const boardSize = 9;
type Board = number[][];
type Status = boolean[][];
type GameDifficulty = 'easy' | 'medium' | 'hard';
const STORAGE_KEY = 'sudoku_game_state';

export const useGameStore = defineStore('game', {
    state: () => ({
        _solutionBoard: Array.from({ length: boardSize }, () => Array(boardSize).fill(0)) as Board,
        gameBoard: Array.from({ length: boardSize }, () => Array(boardSize).fill(0)) as Board,
        playerBoard: Array.from({ length: boardSize }, () => Array(boardSize).fill(0)) as Board,
        currentFocus: null as { row: number; col: number } | null,
        cellStatus: Array.from({ length: boardSize }, () => 
            Array(boardSize).fill(true)
        ) as Status,
        canInvalid: 3 as number,
        invalidCount: 0 as number,
        gameDifficulty: 'easy' as GameDifficulty,
    }),

    actions: {
        updateStatus() {
            //reset status lại từ đầu
            this.cellStatus = Array.from({ length: boardSize }, () => 
                Array(boardSize).fill(true)
            ) as Status;

            //check từng ô
            for(let i = 0; i < boardSize; i++) {
                for(let j = 0; j < boardSize; j++) {
                    const currentValue = this.playerBoard[i]?.[j];

                     // Bỏ qua ô trống
            if (currentValue === 0) continue;

            //kiểm tra ô hiện tại đúng không
            if(!this.checkCell(i, j, this.playerBoard[i]![j]!)) {
                this.cellStatus[i]![j] = false;
                continue; // Không cần kiểm tra thêm nếu ô hiện tại đã sai
            }

            // Kiểm tra hàng ngang (cùng hàng i, khác cột)
            for (let col = 0; col < boardSize; col++) {
                if (col !== j && this.playerBoard[i]?.[col] === currentValue) {
                    this.cellStatus[i]![j] = false;   // Ô hiện tại
                    this.cellStatus[i]![col] = false; // Ô trùng
                }
            }

            // Kiểm tra cột dọc (cùng cột j, khác hàng)
            for (let row = 0; row < boardSize; row++) {
                if (row !== i && this.playerBoard[row]?.[j] === currentValue) {
                    this.cellStatus[i]![j] = false;   // Ô hiện tại
                    this.cellStatus[row]![j] = false; // Ô trùng
                }
            }

            // Kiểm tra box 3x3
            const startRow = Math.floor(i / 3) * 3;
            const startCol = Math.floor(j / 3) * 3;
            for (let row = startRow; row < startRow + 3; row++) {
                for (let col = startCol; col < startCol + 3; col++) {
                    // Khác vị trí và trùng giá trị
                    if ((row !== i || col !== j) && this.playerBoard[row]?.[col] === currentValue) {
                        this.cellStatus[i]![j] = false;     // Ô hiện tại
                        this.cellStatus[row]![col] = false; // Ô trùng
                    }
                }
            }
                }
            }
        },
        // Lưu vào localStorage
        saveGame() {
            const gameState = {
                _solutionBoard: this._solutionBoard,
                gameBoard: this.gameBoard,
                playerBoard: this.playerBoard,
                cellStatus: this.cellStatus,
                canInvalid: this.canInvalid,
                invalidCount: this.invalidCount,
                gameDifficulty: this.gameDifficulty
            };
            gameFile.saveGame(gameState);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
        },

        // Load từ localStorage
        loadGame(): boolean {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const gameState = JSON.parse(saved);
                    this._solutionBoard = gameState._solutionBoard;
                    this.gameBoard = gameState.gameBoard;
                    this.playerBoard = gameState.playerBoard;
                    this.cellStatus = gameState.cellStatus;
                    this.canInvalid = gameState.canInvalid;
                    this.invalidCount = gameState.invalidCount;
                    this.gameDifficulty = gameState.gameDifficulty;
                    return true;
                } catch (e) {
                    console.error('Failed to load game:', e);
                    return false;
                }
            }
            return false;
        },

        // Shuffle array
        shuffleArray(array: number[]): number[] {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j]!, arr[i]!];
            }
            return arr;
        },

        // Kiểm tra hợp lệ
        checkBoard(board: Board, row: number, col: number, num: number): boolean {
            const currentValue = num;
            if (!currentValue) return false;
            
            // check row
            for (let i = 0; i < boardSize; i++) {
                if (i === col) continue;
                if (board[row]?.[i] === currentValue) {
                    return false;
                }
            }
            // check col
            for (let i = 0; i < boardSize; i++) {
                if (i === row) continue;
                if (board[i]?.[col] === currentValue) {
                    return false;
                }
            }
            // check 3x3
            const startRow = Math.floor(row / 3) * 3;
            const startCol = Math.floor(col / 3) * 3;
            for (let i = startRow; i < startRow + 3; i++) {
                for (let j = startCol; j < startCol + 3; j++) {
                    if (i === row && j === col) continue;
                    if (board[i]?.[j] === currentValue) {
                        return false;
                    }
                }
            }
            return true;
        },

        // Tạo board mới
        generateBoard() {
            // Reset solution board
            this.fillBoard(0, 0);
        },

        fillBoard(row: number, col: number = 0) {
            if( row === boardSize) {
                return true; // Đã điền xong toàn bộ bảng
            }

            const nextRow = row + (col + 1 === boardSize ? 1 : 0);
            const nextCol = (col + 1) % boardSize;
            const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

            for (const num of numbers) {
                this._solutionBoard[row]![col] = num;
                if (this.checkBoard(this._solutionBoard, row, col, this._solutionBoard[row]![col]!)) {
                    if (this.fillBoard(nextRow, nextCol)) {
                        return true;
                    }
                }
                this._solutionBoard[row]![col] = 0; // Reset on backtrack
            }
            return false;
        },
        solveSudoku(
            board: Board, 
            { countMode = false, limit = 1, stepCount = null }: { 
                countMode?: boolean; 
                limit?: number; 
                stepCount?: { value: number } | null 
            } = {}
        ): number | boolean {
            let count = 0;
            const solve = (b: Board): boolean => {
                for (let row = 0; row < 9; row++) {
                    for (let col = 0; col < 9; col++) {
                        if (b[row]![col] === 0) {
                            for (let num = 1; num <= 9; num++) {
                                if (this.checkBoard(b, row, col, num)) {
                                    b[row]![col] = num;
                                    if (stepCount !== null) {
                                        stepCount.value++;
                                    }
                                    if (solve(b) && !countMode) return true;
                                    b[row]![col] = 0;
                                }
                            }
                            return false;
                        }
                    }
                }
                count++;
                return count >= limit && countMode;
            };
            const clone = board.map(row => [...row]);
            solve(clone);
            return countMode ? count : count > 0;
        },

        // Tạo game mới
        newGame(canInvalid: number = 3, gameDifficulty: GameDifficulty = 'easy') {
            const difficulty = {
                'easy': [20, 30],
                'medium': [31, 40],
                'hard': [41, 50]
            }
            const [minNull, maxNull] = difficulty[gameDifficulty];
            let nullCell = Math.floor(Math.random() * (maxNull! - minNull! + 1)) + minNull!;

            this.generateBoard();
            this.cellStatus = Array.from({ length: boardSize }, () => 
                Array(boardSize).fill(true)
            ) as Status;

            // Copy solution to game board
            this.gameBoard = this._solutionBoard.map(row => [...row]);
            this.invalidCount = 0;
            this.canInvalid = canInvalid;

            while (nullCell > 0) {
                const row = Math.floor(Math.random() * boardSize);
                const col = Math.floor(Math.random() * boardSize);
                if (this.gameBoard[row]?.[col] !== 0) {
                    this.gameBoard[row]![col] = 0;
                    if(this.solveSudoku(this.gameBoard, { countMode: true, limit: 2 }) !== 1) {
                        //nếu không duy nhất 1 nghiệm thì khôi phục lại, xoá ô khác
                        this.gameBoard[row]![col] = this._solutionBoard[row]![col]!;
                        continue;
                    }
                    nullCell--;
                }
            }

            // playerBoard lưu trạng thái người chơi
            this.playerBoard = this.gameBoard.map(row => [...row]);

            this.saveGame();
        },

        checkCell(row: number, col: number, value: number): boolean {
            return this._solutionBoard[row]?.[col] === value;
        },

        // Cập nhật ô người chơi nhập
        updateCell(row: number, col: number, value: number) {
            this.playerBoard[row]![col] = value;
            if(!this.checkCell(row, col, value) && value !== 0) {
                this.invalidCount += 1;
            }

            this.updateStatus();

            this.saveGame();
        },

        // Set focus
        setFocus(focus: { row: number; col: number } | null) {
            this.currentFocus = focus;
        },

        clearFocus() {
            this.currentFocus = null;
        },

        clearPlayerBoard() {
            this.playerBoard = this.gameBoard.map(row => [...row]);
            this.updateStatus();
            this.saveGame();
        },

        //clear all game state
        clearGameState() {
            localStorage.removeItem(STORAGE_KEY);
        },
        // Reset game
        resetGame(canInvalid: number = 3, gameDifficulty: GameDifficulty = 'easy') {
            localStorage.removeItem(STORAGE_KEY);
            this.newGame(canInvalid, gameDifficulty);
            this.clearFocus();
        },

        // Khởi tạo game
        initGame(canInvalid: number = 3, gameDifficulty: GameDifficulty = 'easy') {
            if (!this.loadGame()) {
                this.newGame(canInvalid, gameDifficulty);
            }
        },
        isWin(): boolean {
            for (let i = 0; i < boardSize; i++) {
                for (let j = 0; j < boardSize; j++) {
                    if (this.playerBoard[i]?.[j] !== this._solutionBoard[i]?.[j]) {
                        return false;
                    }
                }
            }
            return true;
        },
        isLose(): boolean {
            return this.invalidCount >= this.canInvalid;
        }
    },
    getters: {
        getInvalidCount(): number {
            return this.invalidCount;
        },
        getCanInvalid(): number {
            return this.canInvalid;
        },
        getGameProgress(): number {
            let cell: number = 0;
            for(let i = 0; i < boardSize; i++) {
                for(let j = 0; j < boardSize; j++) {
                    if(this.playerBoard[i]?.[j] !== this._solutionBoard[i]?.[j]) {
                        cell++;                        
                    }
                }
            }
            return cell;
        },
        getGameNullCell(): number {
            let cell: number = 0;
            for(let i = 0; i < boardSize; i++) {
                for(let j = 0; j < boardSize; j++) {
                    if(this.gameBoard[i]?.[j] === 0) {
                        cell++;                        
                    }
                }
            }
            return cell;
        }
    }
});