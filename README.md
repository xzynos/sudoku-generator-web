# Sudoku Generator Web

Web-based Sudoku Generator written in mostly JavaScript

## Design Goals

This Sudoku generator aims to allow users to generate as many Sudoku puzzles as they desire by performing the generation on the client side through the use of JavaScript before rendering the puzzles as a downloadable PDF file.

## Running The Application

### Python3

1. Clone the project
2. Change your working directory into the cloned project
3. Start the Python3 HTTP server using `python -m http.server --bind 0.0.0.0 8080` which serves the application using all interfaces on TCP port 8080

## Motivation

My dad is an avid Sudoku player who thrives on challenging puzzles. He often finishes entire puzzle books faster than we can buy them. I initially explored existing online Sudoku generators, but they came with limitations. Many restrict the number of puzzles you can generate due to their reliance on server-side generation, and the puzzles themselves are often too easy to keep him engaged.

To address these limitations, I built this Sudoku generator with one goal in mind: to create a steady supply of genuinely challenging Sudoku puzzles that meet his standards.
