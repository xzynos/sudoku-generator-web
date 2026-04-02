import { jsPDF } from "https://esm.sh/jspdf";

/**
 * Generate PDF from Sudoku puzzles
 */
export class SudokuPDFRenderer {
    constructor() {
        this.document = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        this.pageWidth = this.document.internal.pageSize.getWidth();
        this.pageHeight = this.document.internal.pageSize.getHeight();
    }

    /**
     * Render Sudoku puzzles as PDF and save to file
     */
    render(
        sudokuPuzzles,
    ) {
        this.document.setFont("courier", "normal");

        this._renderPuzzlePages(sudokuPuzzles);

        if (this.document.getNumberOfPages() % 2 !== 0) {
            this.document.addPage();
        }
        this.document.addPage();

        this._renderSolutionPages(sudokuPuzzles);

        return this.document.output("arraybuffer");
    }

    /**
     * Render puzzles pages
     */
    _renderPuzzlePages(sudokuPuzzles) {
        const pageRows = 2;
        const pageColumns = 2;
        const pageMarginTop = 20;
        const gridsPerPage = pageRows * pageColumns;
        const gridSize = 82;
        const gridHeaderOffset = 4;
        const gridHeaderFontSize = 15;
        const gridCellFontSize = 15;
        const gridGapHorizontal = 18;
        const gridGapVertical = 32;

        const gridPositions = this._generateGridPositions(
            pageRows,
            pageColumns,
            pageMarginTop,
            gridSize,
            gridGapHorizontal,
            gridGapVertical,
        );

        for (let index = 0; index < sudokuPuzzles.length; index++) {
            if (index > 0 && index % gridsPerPage === 0) {
                this.document.addPage();
            }

            const gridPosition = gridPositions[index % gridsPerPage];
            const gridHeaderText = `Puzzle ${index + 1}`;

            this._renderSudokuGrid(
                sudokuPuzzles[index].gridPuzzle,
                gridPosition.x,
                gridPosition.y,
                gridSize,
                gridHeaderText,
                gridHeaderOffset,
                gridHeaderFontSize,
                gridCellFontSize,
            );
        }
    }

    /**
     * Render solutions pages
     */
    _renderSolutionPages(sudokuPuzzles) {
        const pageRows = 4;
        const pageColumns = 3;
        const pageMarginTop = 16;
        const gridsPerPage = pageRows * pageColumns;
        const gridSize = 52;
        const gridHeaderOffset = 3;
        const gridHeaderFontSize = 10;
        const gridCellFontSize = 10;
        const gridGapHorizontal = 14;
        const gridGapVertical = 13;

        const gridPositions = this._generateGridPositions(
            pageRows,
            pageColumns,
            pageMarginTop,
            gridSize,
            gridGapHorizontal,
            gridGapVertical,
        );

        for (let index = 0; index < sudokuPuzzles.length; index++) {
            if (index > 0 && index % gridsPerPage === 0) {
                this.document.addPage();
            }

            const gridPosition = gridPositions[index % gridsPerPage];
            const gridHeaderText = `Solution ${index + 1}`;

            this._renderSudokuGrid(
                sudokuPuzzles[index].gridSolution,
                gridPosition.x,
                gridPosition.y,
                gridSize,
                gridHeaderText,
                gridHeaderOffset,
                gridHeaderFontSize,
                gridCellFontSize,
            );
        }
    }

    /**
     * Generate positions of Sudoku grids on page
     */
    _generateGridPositions(
        pageRows,
        pageColumns,
        pageMarginTop,
        gridSize,
        gridGapHorizontal,
        gridGapVertical,
    ) {
        const contentWidth = pageColumns * gridSize + (pageColumns - 1) * gridGapHorizontal;
        const startX = (this.pageWidth - contentWidth) / 2;

        const gridPositions = [];

        for (let row = 0; row < pageRows; row++) {
            for (let column = 0; column < pageColumns; column++) {
                gridPositions.push({
                    x: startX + column * (gridSize + gridGapHorizontal),
                    y: pageMarginTop + row * (gridSize + gridGapVertical),
                });
            }
        }

        return gridPositions;
    }

    /**
     * Render Sudoku grid on page
     */
    _renderSudokuGrid(
        grid,
        gridStartX,
        gridStartY,
        gridSize,
        gridHeaderText,
        gridHeaderOffset,
        gridHeaderFontSize,
        gridCellFontSize,
    ) {
        const cellSize = gridSize / 9;

        // Render grid header
        this.document.setFont("courier", "bold");
        this.document.setFontSize(gridHeaderFontSize);
        this.document.text(
            gridHeaderText,
            gridStartX + gridSize / 2,
            gridStartY - gridHeaderOffset,
            {
                align: "center",
                baseline: "bottom",
            }
        );

        // Render grid cell borders
        for (let index = 0; index <= 9; index++) {
            this.document.setLineWidth(index % 3 === 0 ? 0.8 : 0.2);

            this.document.line(
                gridStartX,
                gridStartY + index * cellSize,
                gridStartX + gridSize,
                gridStartY + index * cellSize
            );

            this.document.line(
                gridStartX + index * cellSize,
                gridStartY,
                gridStartX + index * cellSize,
                gridStartY + gridSize
            );
        }

        // Render grid cell contents
        this.document.setFont("courier", "bold");
        this.document.setFontSize(gridCellFontSize);
        for (let gridRow = 0; gridRow < 9; gridRow++) {
            for (let gridColumn = 0; gridColumn < 9; gridColumn++) {
                const value = grid[gridRow][gridColumn];

                if (
                    value === 0 ||
                    value === null ||
                    value === undefined
                ) {
                    continue
                }

                const valueX = gridStartX + gridColumn * cellSize + cellSize / 2;
                const valueY = gridStartY + gridRow * cellSize + cellSize / 2;

                this.document.text(
                    String(value),
                    valueX,
                    valueY,
                    {
                        align: "center",
                        baseline: "middle",
                    }
                );
            }
        }
    }
}
