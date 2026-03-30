import { SudokuPDFRenderer } from "./sudoku_pdf_renderer.js";

self.onmessage = function(event) {
    const renderSudokuPuzzles = event.data.renderSudokuPuzzles

    const sudokuPdfRenderer = new SudokuPDFRenderer();

    const sudokuPdfBuffer = sudokuPdfRenderer.render(renderSudokuPuzzles);

    self.postMessage({
        type: "SUDOKU_PDF",
        sudokuPdf: sudokuPdfBuffer
    });

    self.postMessage({
        type: "COMPLETION",
    });
};
