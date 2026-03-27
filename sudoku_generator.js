import { SudokuPuzzle } from "./models.js";

/**
 * Generate Sudoku puzzles
 */
export class SudokuGenerator {
    constructor() {}

    /**
     * Generate a Sudoku puzzle
     */
    generate(difficultyLabel = "medium") {
        const gridSolution = this._generateSolution();
        const gridPuzzle = this._derivePuzzle(gridSolution, difficultyLabel);

        return new SudokuPuzzle(
            gridPuzzle,
            gridSolution,
            difficultyLabel,
            {
                difficultyScore: this._countGridCellsEmpty(gridPuzzle) / 81,
                cluesCount: this._countGridCellsFilled(gridPuzzle),
            },
        );
    }

    /**
     * Generate a valid Sudoku solution
     */
    _generateSolution() {
        const grid = this._emptyGrid();

        this._fillGrid(grid);

        return grid;
    }

    /**
     * Derive a valid Sudoku puzzle from solution
     */
    _derivePuzzle(
        solutionGrid,
        difficultyLabel
    ) {
        const removalAttemptsDifficulty = {
            easy: 20,
            medium: 30,
            hard: 40,
            extreme: 81,
        };

        const gridCells = solutionGrid.map(gridRow => [...gridRow]);

        const gridCoordinates = []
        for (let gridRow = 0; gridRow <= 8; gridRow++) {
            for (let gridColumn = 0; gridColumn <= 8; gridColumn++) {
                gridCoordinates.push([gridRow, gridColumn]);
            }
        }
        this._shuffleArray(gridCoordinates)

        let removalAttemptsRemaining = removalAttemptsDifficulty[difficultyLabel] || 0;

        while (
            gridCoordinates.length > 0 &&
            removalAttemptsRemaining > 0
        ) {
            const gridCoordinate = gridCoordinates.pop();
            const gridRow = gridCoordinate[0];
            const gridColumn = gridCoordinate[1];

            const gridCellValue = gridCells[gridRow][gridColumn];

            gridCells[gridRow][gridColumn] = 0;

            const solutionsCount = this._countPuzzleSolutions(gridCells);

            if (solutionsCount !== 1) {
                gridCells[gridRow][gridColumn] = gridCellValue;
            }

            removalAttemptsRemaining--;
        }

        return gridCells;
    }

    /**
     * Count number of solutions in Sudoku grid
     */
    _countPuzzleSolutions(grid) {
        let solutionsCount = 0;

        const solvePuzzle = (gridCells) => {
            if (solutionsCount > 1) {
                return;
            }

            for (let gridRow = 0; gridRow < 9; gridRow++) {
                for (let gridColumn = 0; gridColumn < 9; gridColumn++) {
                    if (gridCells[gridRow][gridColumn] === 0) {
                        for (let gridCellValue = 1; gridCellValue <= 9; gridCellValue++) {
                            if (this._isValuePlacementValid(gridCells, gridRow, gridColumn, gridCellValue)) {
                                gridCells[gridRow][gridColumn] = gridCellValue;

                                solvePuzzle(gridCells);

                                gridCells[gridRow][gridColumn] = 0;
                            }
                        }

                        return;
                    }
                }
            }

            solutionsCount++;
        };

        solvePuzzle(grid.map(gridRow => [...gridRow]));

        return solutionsCount;
    }

    /**
     * Validate placement of value in Sudoku grid
     */
    _isValuePlacementValid(
        grid,
        row,
        column,
        value,
    ) {
        for (let index = 0; index < 9; index++) {
            if (grid[row][index] === value || grid[index][column] === value) {
                return false;
            }
        }

        const boxRowStart = Math.floor(row / 3) * 3;
        const boxColumnStart = Math.floor(column / 3) * 3;

        for (let boxRowOffset = 0; boxRowOffset < 3; boxRowOffset++) {
            for (let boxColumnOffset = 0; boxColumnOffset < 3; boxColumnOffset++) {
                if (grid[boxRowStart + boxRowOffset][boxColumnStart + boxColumnOffset] === value) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Empty Sudoku grid by filling with 0s
     */
    _emptyGrid() {
        return Array.from({ length: 9 }, () => Array(9).fill(0));
    }

    /**
     * Fill Sudoku grid with values using recursive backtracking fill
     */
    _fillGrid(grid) {
        for (let gridRow = 0; gridRow < 9; gridRow++) {
            for (let gridColumn = 0; gridColumn < 9; gridColumn++) {
                if (grid[gridRow][gridColumn] === 0) {
                    const gridCellValues = [1,2,3,4,5,6,7,8,9];
                    this._shuffleArray(gridCellValues);

                    for (let gridCellValue of gridCellValues) {
                        if (
                            this._isValuePlacementValid(
                                grid,
                                gridRow,
                                gridColumn,
                                gridCellValue
                            )
                        ) {
                            grid[gridRow][gridColumn] = gridCellValue;

                            if (this._fillGrid(grid)) {
                                return true;
                            }

                            grid[gridRow][gridColumn] = 0;
                        }
                    }

                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Count number of cells in grid where value is 0
     */
    _countGridCellsEmpty(grid) {
        return grid.flat().filter(x => x === 0).length;
    }

    /**
     * Count number of cells in grid where value is not 0
     */
    _countGridCellsFilled(grid) {
        return grid.flat().filter(x => x !== 0).length;
    }

    /**
     * Shuffle elements in array
     */
    _shuffleArray(arrayReference) {
        for (let index1 = arrayReference.length - 1; index1 > 0; index1--) {
            const index2 = Math.floor(Math.random() * (index1 + 1));

            [arrayReference[index1], arrayReference[index2]] = [arrayReference[index2], arrayReference[index1]];
        }
    }
}
