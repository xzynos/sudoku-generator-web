/**
 * Store generated Sudoku puzzle, solution, and metadata
 */
export class SudokuPuzzle {
    constructor(
        gridPuzzle,
        gridSolution,
        difficultyLabel,
        difficultyMetadata,
    ) {
        this.gridPuzzle = gridPuzzle;
        this.gridSolution = gridSolution;
        this.difficultyLabel = difficultyLabel;
        this.difficultyMetadata = difficultyMetadata;
    }
}
