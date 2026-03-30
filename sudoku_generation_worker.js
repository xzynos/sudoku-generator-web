import { SudokuGenerator } from "./sudoku_generator.js";

self.onmessage = function(event) {
    const generateSudokuPuzzlesDifficultyLabel = event.data.generateSudokuPuzzlesDifficultyLabel
    const generateSudokuPuzzlesCount = event.data.generateSudokuPuzzlesCount

    const sudokuGenerator = new SudokuGenerator();

    for (let index = 0; index < generateSudokuPuzzlesCount; index++) {
        const sudokuPuzzle = sudokuGenerator.generate(generateSudokuPuzzlesDifficultyLabel)

        self.postMessage({
            type: "SUDOKU_PUZZLE",
            sudokuPuzzle: sudokuPuzzle,
        });
    }

    self.postMessage({
        type: "COMPLETION",
    });
};
