const generateSudokuPuzzlesDifficultyInput = document.getElementById("generate-sudoku-puzzles-difficulty");
const generateSudokuPuzzleCountInput = document.getElementById("generate-sudoku-puzzles-count");
const generateSudokuPuzzleConcurrencyInput = document.getElementById("generate-sudoku-puzzles-concurrency");
const generateSudokuPdfButton = document.getElementById("generate-sudoku-pdf-button");
const generateSudokuMessage = document.getElementById("generate-sudoku-message");

function setGenerateSudokuMessage(message, variant = "default") {
    generateSudokuMessage.textContent = message;
    generateSudokuMessage.classList.remove("is-error", "is-success");

    if (variant === "error") {
        generateSudokuMessage.classList.add("is-error");

        return;
    }
    if (variant === "success") {
        generateSudokuMessage.classList.add("is-success");

        return;
    }
}

generateSudokuPdfButton.addEventListener("click", async function() {
    const generateSudokuPuzzlesDifficultyLabelStr = generateSudokuPuzzlesDifficultyInput.value;
    const generateSudokuPuzzleCountInt = Number.parseInt(generateSudokuPuzzleCountInput.value, 10);

    //#region Perform checks before generating Sudoku puzzles
    if (generateSudokuPuzzleCountInt < 1) {
        setGenerateSudokuMessage("Number of puzzles must be 1 or greater.", "error");

        return;
    }

    if (!window.Worker) {
        setGenerateSudokuMessage("This browser does not support web workers.", "error");

        return;
    }
    //#endregion

    generateSudokuPdfButton.disabled = true;

    //#region Generate Sudoku puzzles
    setGenerateSudokuMessage("Generating Sudoku puzzles.");

    const sudokuPuzzles = [];

    const sudokuGenerationWorkerCount = Math.min(
        (generateSudokuPuzzleConcurrencyInput.checked ? navigator.hardwareConcurrency : 1),
        generateSudokuPuzzleCountInt,
    );
    const sudokuGenerationWorkerPromises = [];
    for (let index = 0; index < sudokuGenerationWorkerCount; index++) {
        // Calculate number of puzzles to generate per worker
        let sudokuGenerationPuzzleCount = Math.floor(generateSudokuPuzzleCountInt / sudokuGenerationWorkerCount);
        sudokuGenerationPuzzleCount += (index < generateSudokuPuzzleCountInt % sudokuGenerationWorkerCount ? 1 : 0);

        // Create and store worker promises in array
        sudokuGenerationWorkerPromises.push(
            new Promise(function(resolve, reject) {
                const sudokuGenerationWorker = new Worker(
                    "sudoku_generation_worker.js",
                    {type: "module"}
                );

                sudokuGenerationWorker.onmessage = function(event) {
                    let sudokuGenerationStatusMessage = "";
                    switch (event.data.type) {
                        case "SUDOKU_PUZZLE":
                            sudokuPuzzles.push(event.data.sudokuPuzzle);
                            sudokuGenerationStatusMessage += "Generated ";
                            sudokuGenerationStatusMessage += `${sudokuPuzzles.length}/${generateSudokuPuzzleCountInt} `;
                            sudokuGenerationStatusMessage += "Sudoku puzzles.";
                            setGenerateSudokuMessage(sudokuGenerationStatusMessage);
                            break;
                        case "COMPLETION":
                            resolve();
                            return;
                    }
                };

                sudokuGenerationWorker.onerror = function(error) {
                    reject(error);
                    sudokuGenerationWorker.terminate();
                };

                sudokuGenerationWorker.postMessage({
                    generateSudokuPuzzlesDifficultyLabel: generateSudokuPuzzlesDifficultyLabelStr,
                    generateSudokuPuzzlesCount: sudokuGenerationPuzzleCount,
                });
            })
        );
    }

    await Promise.all(sudokuGenerationWorkerPromises);
    //#endregion

    //#region Render Sudoku PDF
    setGenerateSudokuMessage("Rendering Sudoku PDF.");

    let sudokuPdfBlob;
    await new Promise(function(resolve, reject) {
        const sudokuPdfRenderingWorker = new Worker(
            "sudoku_pdf_rendering_worker.js",
            {type: "module"}
        );

        sudokuPdfRenderingWorker.onmessage = function(event) {
            switch (event.data.type) {
                case "SUDOKU_PDF":
                    sudokuPdfBlob = new Blob(
                        [event.data.sudokuPdf],
                        {type: "application/pdf"},
                    );
                    break;
                case "COMPLETION":
                    resolve();
                    return;
            }
        };

        sudokuPdfRenderingWorker.onerror = function(error) {
            reject(error);
            sudokuPdfRenderingWorker.terminate();
        };

        sudokuPdfRenderingWorker.postMessage({
            renderSudokuPuzzles: sudokuPuzzles,
        });
    });

    setGenerateSudokuMessage("Rendered Sudoku PDF.");

    let sudokuPdfFilename = "";
    sudokuPdfFilename += "sudoku-";
    sudokuPdfFilename += `${generateSudokuPuzzlesDifficultyLabelStr}-`;
    sudokuPdfFilename += `${generateSudokuPuzzleCountInt}`;
    sudokuPdfFilename += ".pdf";
    const sudokuPdfDownloadUrl = URL.createObjectURL(sudokuPdfBlob);
    const sudokuPdfDownloadElement = document.createElement("a");
    sudokuPdfDownloadElement.href = sudokuPdfDownloadUrl;
    sudokuPdfDownloadElement.download = sudokuPdfFilename;
    sudokuPdfDownloadElement.click();
    URL.revokeObjectURL(sudokuPdfDownloadUrl);
    //#endregion

    generateSudokuPdfButton.disabled = false;

    setGenerateSudokuMessage("Sudoku PDF generation is complete.", "success");
});
