// ai/difficulty.js
import { findBestMove } from './minimax.js'; // Import advanced AI

// --- Basic AI ---
function getRandomMove(boardState) {
    const emptyCells = [];
    boardState.forEach((cell, index) => {
        if (cell === '') {
            emptyCells.push(index);
        }
    });

    if (emptyCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    }
    return -1; // No available moves
}

// --- AI Strategy Selection ---
// difficulty: 'normal' or 'advanced'
// boardState: current array representing the board ['', 'X', 'O', ...]
// playerMark: the mark the AI uses ('O' in this setup)
export function getComputerMove(difficulty, boardState, playerMark) {
    console.log(`AI (${difficulty}) thinking...`);
    if (difficulty === 'advanced') {
        // Use Minimax for the 'advanced' difficulty
        const bestMove = findBestMove(boardState, playerMark);
        console.log(`AI (Advanced) chose move: ${bestMove}`);
        return bestMove;

    } else {
        // 'normal' difficulty uses random placement
        const randomMove = getRandomMove(boardState);
        console.log(`AI (Normal) chose move: ${randomMove}`);
        return randomMove;
    }
    // Add more difficulties here if needed
}