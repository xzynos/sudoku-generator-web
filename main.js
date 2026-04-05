const generateSudokuPuzzlesDifficultyInput = document.getElementById("generate-sudoku-puzzles-difficulty");
const generateSudokuPuzzleCountInput = document.getElementById("generate-sudoku-puzzles-count");
const generateSudokuPdfButton = document.getElementById("generate-sudoku-pdf-button");
const generateSudokuMessage = document.getElementById("generate-sudoku-message");

generateSudokuPdfButton.addEventListener("click", async function() {
    const generateSudokuPuzzlesDifficultyLabelStr = generateSudokuPuzzlesDifficultyInput.value;
    const generateSudokuPuzzleCountInt = Number.parseInt(generateSudokuPuzzleCountInput.value, 10);

    //#region Perform checks before generating Sudoku puzzles
    if (generateSudokuPuzzleCountInt < 1) {
        generateSudokuMessage.innerHTML = "Number of puzzles must be 1 or greater.";

        return;
    }

    if (!window.Worker) {
        generateSudokuMessage.innerHTML = "This browser does not support web workers.";

        return;
    }
    //#endregion

    generateSudokuPdfButton.disabled = true;

    //#region Generate Sudoku puzzles
    generateSudokuMessage.innerHTML = "Generating Sudoku puzzles.";

    const sudokuPuzzles = [];

    const sudokuGenerationWorkerCount = Math.min(
        16,
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
                            generateSudokuMessage.innerHTML = sudokuGenerationStatusMessage;
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
    generateSudokuMessage.innerHTML = "Rendering Sudoku PDF.";

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
});
