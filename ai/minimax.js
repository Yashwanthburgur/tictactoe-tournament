// ai/minimax.js

// --- Minimax Algorithm ---

// Available spots on the board
function getEmptyIndices(board) {
    return board.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);
}

// Check for terminal states (win/draw)
function checkTerminalState(board, playerMark) {
    const opponentMark = playerMark === 'X' ? 'O' : 'X';
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // Return the winning mark ('X' or 'O')
        }
    }

    if (getEmptyIndices(board).length === 0) {
        return 'draw'; // It's a draw
    }

    return null; // Game not over
}


// The minimax function itself
function minimax(newBoard, currentMark, aiMark, humanMark, depth, isMaximizing) {
    const terminalState = checkTerminalState(newBoard);
    if (terminalState) {
        if (terminalState === aiMark) return { score: 10 - depth }; // AI wins
        if (terminalState === humanMark) return { score: depth - 10 }; // Human wins
        if (terminalState === 'draw') return { score: 0 }; // Draw
    }

    const availableMoves = getEmptyIndices(newBoard);
    let bestMove = { score: isMaximizing ? -Infinity : Infinity };


    for (let i = 0; i < availableMoves.length; i++) {
        let moveIndex = availableMoves[i];
        newBoard[moveIndex] = currentMark; // Try the move

        let result = minimax(
            newBoard,
            currentMark === aiMark ? humanMark : aiMark, // Switch player
            aiMark,
            humanMark,
            depth + 1,
            !isMaximizing // Switch optimizing player
        );

        newBoard[moveIndex] = ''; // Undo the move

        // Update best score
        if (isMaximizing) {
            if (result.score > bestMove.score) {
                bestMove.score = result.score;
                bestMove.index = moveIndex;
            }
        } else {
             if (result.score < bestMove.score) {
                bestMove.score = result.score;
                bestMove.index = moveIndex;
            }
        }
         // Basic Alpha-Beta Pruning concept (can be expanded)
        // if (isMaximizing && bestMove.score >= some_beta_value) break;
        // if (!isMaximizing && bestMove.score <= some_alpha_value) break;
    }
     // Ensure an index is returned even if all moves lead to the same score initially
     if (bestMove.index === undefined && availableMoves.length > 0) {
         bestMove.index = availableMoves[0]; // Default to first available move if scores are identical
     }

    return bestMove;
}

// Main function to call minimax
// playerMark is the AI's mark (e.g., 'O')
export function findBestMove(boardState, playerMark) {
    const humanMark = playerMark === 'X' ? 'O' : 'X';
    // AI wants to maximize its score. Start minimax with isMaximizing = true.
    const result = minimax([...boardState], playerMark, playerMark, humanMark, 0, true);
    // If result.index is undefined (e.g., board is full), it might return -1 or handle error
    return result.index !== undefined ? result.index : -1;

}