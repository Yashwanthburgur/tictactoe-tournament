// script.js
// Import necessary functions from modules
import { setupTournament, recordWin, nextRound, getScores, getCurrentRound, getMagicNumber, isTournamentFinished, getPlayerNames, getTournamentWinner } from './tournament/series-manager.js';
import { getComputerMove } from './ai/difficulty.js';

// --- DOM Elements ---
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
const friendSettings = document.getElementById('friend-settings');
const computerSettings = document.getElementById('computer-settings');
const player1NameInput = document.getElementById('player1-name');
const player2NameInput = document.getElementById('player2-name');
const playerNamePvCInput = document.getElementById('player-name-pvc');
const computerNameInput = document.getElementById('computer-name');
const difficultySelect = document.getElementById('difficulty');
const magicNumberInput = document.getElementById('magic-number');
const startGameBtn = document.getElementById('start-game-btn');

// Game Screen Elements
const scorePlayer1Name = document.getElementById('score-player1-name');
const scorePlayer2Name = document.getElementById('score-player2-name');
const scorePlayer1Display = document.getElementById('score-player1');
const scorePlayer2Display = document.getElementById('score-player2');
const currentRoundDisplay = document.getElementById('current-round');
const targetWinsDisplay = document.getElementById('target-wins');
const turnIndicator = document.getElementById('turn-indicator');
const currentPlayerIndicator = document.getElementById('current-player-indicator');
const gameBoard = document.getElementById('game-board');
const cells = document.querySelectorAll('.cell'); // Static NodeList
const gameMessage = document.getElementById('game-message');
const restartRoundBtn = document.getElementById('restart-round-btn');
const newGameBtn = document.getElementById('new-game-btn'); // Button below board
const celebrationElement = document.getElementById('celebration');
const tournamentWinnerName = document.getElementById('tournament-winner-name');
// Reference to the NEW button inside celebration (will add listener in DOMContentLoaded)
let newGameFromCelebBtn = null;

// Audio Elements
const moveSound = document.getElementById('move-sound');
const winSound = document.getElementById('win-sound');
const drawSound = document.getElementById('draw-sound');
const tourneyWinSound = document.getElementById('tourney-win-sound');

// --- Game State (Managed partially here, partially in modules) ---
let gameMode = 'friend'; // 'friend' or 'computer'
let computerDifficulty = 'normal';
let currentPlayer = 'X'; // 'X' or 'O'
let boardState = ['', '', '', '', '', '', '', '', '']; // Represents the 3x3 grid
let isRoundOver = false; // Tracks if the *current round* is finished
let aiPlayerMark = 'O'; // Computer always plays 'O' in this setup

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// --- Utility Functions ---
const playSound = (soundElement) => {
    if (soundElement && soundElement.readyState >= 2) { // Check if sound is ready
         soundElement.currentTime = 0; // Rewind to start
         soundElement.play().catch(e => {
             console.warn("Audio play failed (possibly needs user interaction first):", e);
         });
    } else if (soundElement) {
        console.warn("Sound not ready:", soundElement.src);
        soundElement.load(); // Try loading it again
    }
};

const updateScreen = (screenToShow) => {
    setupScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    document.body.scrollTop = 0; // Scroll to top
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

    if (screenToShow === 'setup') {
        setupScreen.classList.add('active');
    } else if (screenToShow === 'game') {
        gameScreen.classList.add('active');
    }
};

// --- Setup Screen Logic ---
gameModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        gameMode = e.target.value;
        friendSettings.classList.toggle('hidden', gameMode !== 'friend');
        computerSettings.classList.toggle('hidden', gameMode !== 'computer');
    });
});

startGameBtn.addEventListener('click', () => {
    const numWins = parseInt(magicNumberInput.value);
    if (isNaN(numWins) || numWins < 1) {
        // Use a simple alert or a more integrated message system if available
        alert("Magic Number must be at least 1.");
        // displayMessage("Magic Number must be at least 1.", "error", 3000); // Use displayMessage if you prefer
        return;
    }

    let p1Name, p2Name;
    if (gameMode === 'friend') {
        p1Name = player1NameInput.value.trim() || 'Player 1';
        p2Name = player2NameInput.value.trim() || 'Player 2';
    } else {
        p1Name = playerNamePvCInput.value.trim() || 'Player';
        p2Name = computerNameInput.value.trim() || 'Computer';
        computerDifficulty = difficultySelect.value;
    }

    // Use the imported function to set up the tournament state
    setupTournament(p1Name, p2Name, numWins);

    // Update UI elements that depend on setup
    updateScoreboard(); // Includes names and target wins now
    celebrationElement.classList.remove('show'); // Ensure celebration is hidden

    updateScreen('game');
    startNewRound(); // Start the first round
});


// --- Game Screen Logic ---

function startNewRound() {
    boardState = ['', '', '', '', '', '', '', '', ''];
    isRoundOver = false;
    currentPlayer = 'X'; // Player X always starts the round
    displayMessage('', 'info'); // Clear previous message
    restartRoundBtn.classList.add('hidden'); // Hide until round end

    // Reset visual board
    cells.forEach((cell) => {
        cell.textContent = '';
        cell.className = 'cell'; // Reset classes (removes x, o, win-cell)
        // Remove old listener before adding new one (safer than relying only on {once:true})
        // cell.removeEventListener('click', handleCellClick); // Optional: Explicit removal
        cell.addEventListener('click', handleCellClick, { once: true });
    });

    enableBoardInput(); // Ensure board is clickable
    updateTurnIndicator();
    updateScoreboard(); // Update round number display
}

function updateScoreboard() {
    const currentScores = getScores();
    const names = getPlayerNames();
    const round = getCurrentRound();
    const target = getMagicNumber();

    scorePlayer1Name.textContent = names.X;
    scorePlayer2Name.textContent = names.O;
    scorePlayer1Display.textContent = currentScores.X;
    scorePlayer2Display.textContent = currentScores.O;
    currentRoundDisplay.textContent = round;
    targetWinsDisplay.textContent = target;
}

function updateTurnIndicator() {
    if (isRoundOver || isTournamentFinished()) {
        turnIndicator.textContent = 'Round Over'; // Or Tournament Over
        return;
    }

    const names = getPlayerNames();
    const currentPlayerName = currentPlayer === 'X' ? names.X : names.O;
    // Update the span directly inside the indicator
    currentPlayerIndicator.textContent = `${currentPlayer} (${currentPlayerName})`;
    turnIndicator.style.color = currentPlayer === 'X' ? 'var(--primary-color)' : 'var(--danger-color)';
}

function handleCellClick(event) {
    // Ignore clicks if round/tournament over OR if it's AI's turn
    if (isRoundOver || isTournamentFinished() || (gameMode === 'computer' && currentPlayer === aiPlayerMark)) {
        return;
    }

    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.index);

    // Check if cell is empty (should be handled by {once:true}, but safe check)
    if (boardState[clickedCellIndex] !== '') {
        return;
    }

    // Make the move
    if (makeMove(clickedCellIndex, currentPlayer)) {
        // Check game state AFTER the move was successful
        if (!isRoundOver && !isTournamentFinished()) {
             // If it's PvC mode and now the computer's turn
            if (gameMode === 'computer' && currentPlayer === aiPlayerMark) {
               disableBoardInput(); // Prevent player clicks during AI thinking/move
               setTimeout(triggerComputerMove, 600); // AI moves after a short delay
            }
        }
    }
}

 function makeMove(index, player) {
    if (boardState[index] !== '' || isRoundOver || isTournamentFinished()) {
         console.warn("Attempted invalid move at index:", index);
         return false; // Move invalid
    }

    boardState[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
    playSound(moveSound);

    // Check for win/draw AFTER the move is visually made
    const winner = checkWinCondition(player); // Check if 'player' just won
    if (winner) {
        endRound(winner); // Pass the winner ('X' or 'O')
    } else if (checkDrawCondition()) {
        endRound('draw');
    } else {
        // If no win/draw, switch player
        switchPlayer();
        updateTurnIndicator();
    }
    return true; // Move was successful
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    // updateTurnIndicator() is called after switch in makeMove() if game continues
}

// Checks if the specified player has won, returns winning player or null
function checkWinCondition(player) {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (boardState[a] === player && boardState[b] === player && boardState[c] === player) {
            // Highlight winning cells
             combination.forEach(index => cells[index].classList.add('win-cell'));
            return player; // Return the winner
        }
    }
    return null; // No winner yet
}

// Checks if the game is a draw
function checkDrawCondition() {
    // It's a draw if all cells are filled AND there's no winner yet found
    return boardState.every(cell => cell !== '');
}

// --- MODIFIED endRound function ---
function endRound(result) { // result is 'X', 'O', or 'draw'
    isRoundOver = true;
    disableBoardInput(); // Stop further moves
    updateTurnIndicator(); // Show "Round Over"

    if (result === 'draw') {
        displayMessage("It's a Draw!", "draw");
        playSound(drawSound);
        // Show next round button only if tournament isn't over
        if (!isTournamentFinished()) {
             restartRoundBtn.classList.remove('hidden');
             restartRoundBtn.textContent = "Start Next Round";
        }
    } else {
        // It's a win for 'X' or 'O'
        recordWin(result); // Update score via series-manager (this might set isTournamentFinished to true)
        const names = getPlayerNames();
        const winnerName = result === 'X' ? names.X : names.O;
        updateScoreboard(); // Reflect new score

        // Check if the tournament ended *AFTER* recording the win
        if (isTournamentFinished()) {
            // Tournament ended with this win, go directly to tournament end sequence
            endTournament(result); // Pass winning player mark
            return; // Stop further execution in endRound (DO NOT play winSound or show Next Round)
        } else {
            // Tournament is NOT over yet, proceed with normal round win
            displayMessage(`${winnerName} (${result}) wins the round!`, "win");
            playSound(winSound); // Play regular win sound
            restartRoundBtn.classList.remove('hidden');
            restartRoundBtn.textContent = "Start Next Round";
        }
    }
}

// Consolidated function to handle resetting and going to setup
function resetAndGoToSetup() {
    celebrationElement.classList.remove('show'); // Hide celebration if shown
    displayMessage('', 'info'); // Clear any lingering messages
    updateScreen('setup');
    // Optional: Reset form fields if desired
    // player1NameInput.value = 'Player 1'; // etc...
}

// Called only when the entire tournament is won
function endTournament(winningPlayerMark) {
    const names = getPlayerNames();
    const winnerName = winningPlayerMark === 'X' ? names.X : names.O;
    // Update final message display
    displayMessage(`${winnerName} wins the tournament!`, "win", 0); // Persist message
    playSound(tourneyWinSound); // Play ONLY the tournament win sound
    restartRoundBtn.classList.add('hidden'); // Hide next round button permanently

    // Show celebration overlay
    tournamentWinnerName.textContent = winnerName;
    celebrationElement.classList.add('show');
    // The "New Game Setup" button inside the overlay will handle resetting
}


function triggerComputerMove() {
    if (isRoundOver || isTournamentFinished()) return; // Double check state

    // Get the move index from the AI module
    const moveIndex = getComputerMove(computerDifficulty, boardState, aiPlayerMark);

    if (moveIndex !== -1 && boardState[moveIndex] === '') {
         // Directly call makeMove for the AI
        if (makeMove(moveIndex, aiPlayerMark)) {
             // Re-enable board for the player *if* the game didn't end on AI's move
             if (!isRoundOver && !isTournamentFinished()) {
                enableBoardInput();
            }
        } else {
             // Handle rare case where makeMove fails (shouldn't happen with checks)
             console.error("AI makeMove failed unexpectedly for index:", moveIndex);
             enableBoardInput(); // Ensure board is re-enabled
        }
    } else {
        console.error("AI returned invalid move index:", moveIndex, "Board:", boardState);
        // If AI fails, re-enable board for player
        enableBoardInput();
    }
}

 function disableBoardInput() {
    cells.forEach(cell => {
         // Remove listener OR just change cursor for visual feedback
         // cell.removeEventListener('click', handleCellClick);
         cell.style.cursor = 'not-allowed';
    });
}

function enableBoardInput() {
     cells.forEach((cell, index) => {
         // Restore cursor
         cell.style.cursor = 'pointer';
         // Re-add listener ONLY to empty cells if not using {once:true} or if removed
         if (boardState[index] === '' && !isRoundOver && !isTournamentFinished()) {
            // Ensure no duplicates if manually removing/adding
            // cell.removeEventListener('click', handleCellClick);
            // cell.addEventListener('click', handleCellClick, { once: true });
            // If using {once:true}, simply resetting cursor might be enough visually
            // The listener added in startNewRound with {once:true} handles clicks correctly
         }
     });
}

// Display messages with style and optional timeout
let messageTimeout;
function displayMessage(msg, type = 'info', duration = 3000) {
     clearTimeout(messageTimeout); // Clear previous timeout if any
     gameMessage.textContent = msg;
     gameMessage.className = `message ${type}`; // Apply class for styling

    if (duration > 0) {
        messageTimeout = setTimeout(() => {
            // Avoid clearing persistent messages (like tournament win)
            if (gameMessage.textContent === msg) { // Check if message hasn't changed
                gameMessage.textContent = '';
                gameMessage.className = 'message'; // Reset class
            }
        }, duration);
    }
}

// --- Event Listeners Setup (DOM Ready) ---
document.addEventListener('DOMContentLoaded', () => {
    // Find the button inside the celebration overlay
    newGameFromCelebBtn = document.getElementById('new-game-celeb-btn');
    if (newGameFromCelebBtn) {
        newGameFromCelebBtn.addEventListener('click', resetAndGoToSetup);
    } else {
        console.error("Button with ID 'new-game-celeb-btn' not found!");
    }

    // Listener for the regular "New Game Setup" button below the board
    newGameBtn.addEventListener('click', resetAndGoToSetup);

    // Listener for the "Next Round" button
    restartRoundBtn.addEventListener('click', () => {
        if (!isTournamentFinished()) {
            if (nextRound()) { // Advance round using series-manager
                startNewRound(); // Start the visual/logical new round
            }
        }
    });

    // --- Initial Setup ---
    updateScreen('setup'); // Show setup screen first

}); // End DOMContentLoaded