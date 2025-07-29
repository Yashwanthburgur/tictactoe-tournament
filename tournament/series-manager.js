// tournament/series-manager.js

let scores = { X: 0, O: 0 };
let currentRound = 1;
let magicNumber = 3; // Default, will be updated from setup
let isTournamentOver = false;
let playerNames = { X: 'Player 1', O: 'Player 2' };

// Function to initialize or reset the tournament state
export function setupTournament(p1Name, p2Name, targetWins) {
    scores = { X: 0, O: 0 };
    currentRound = 1;
    magicNumber = parseInt(targetWins) || 3;
    isTournamentOver = false;
    playerNames = { X: p1Name, O: p2Name };
    console.log(`Tournament Setup: ${p1Name} vs ${p2Name}, first to ${magicNumber} wins.`);
}

// Function to record a round result
export function recordWin(player) { // player is 'X' or 'O'
    if (!isTournamentOver && player) {
        scores[player]++;
        console.log(`Round ${currentRound} win for ${player}. Score: X=${scores.X}, O=${scores.O}`);
        checkTournamentEnd();
    }
}

// Function to advance to the next round (if not over)
export function nextRound() {
    if (!isTournamentOver) {
        currentRound++;
        console.log(`Starting Round ${currentRound}`);
        return true; // Indicate round advanced
    }
    return false; // Tournament is over
}

// Function to check if the tournament has ended
function checkTournamentEnd() {
    if (scores.X >= magicNumber || scores.O >= magicNumber) {
        isTournamentOver = true;
        console.log("Tournament Over!");
    }
}

// Getters for current state
export function getScores() {
    return { ...scores }; // Return a copy
}

export function getCurrentRound() {
    return currentRound;
}

export function getMagicNumber() {
    return magicNumber;
}

export function isTournamentFinished() {
    return isTournamentOver;
}

export function getPlayerNames() {
    return { ...playerNames };
}

export function getTournamentWinner() {
    if (!isTournamentOver) return null;
    return scores.X >= magicNumber ? 'X' : 'O';
}