// Server/wwwroot/king/js/display/updateGameDisplay.js
import { gameState, playerId } from "../core/variables.js";
import { updatePlayersDisplay } from "./updatePlayersDisplay.js";
import { updateHandDisplay } from "./updateHandDisplay.js";
import { updateTrickDisplay } from "./updateTrickDisplay.js";
import { updateScoresDisplay } from "./updateScoresDisplay.js";
import { updateRoundDisplay } from "./updateRoundDisplay.js";
import { updateGameActions } from "./updateGameActions.js";

export function updateGameDisplay() {
    if (!gameState) {
        // On home page (no game state), show basic setup
        document.getElementById('gameSetup').style.display = 'block';
        document.getElementById('gameBoard').style.display = 'none';
        
        // Show Other Games button
        const otherGamesBtn = document.getElementById('otherGamesBtn');
        if (otherGamesBtn) {
            otherGamesBtn.classList.remove('hidden');
        }
        return;
    }

    // Hide setup, show game board
    document.getElementById('gameSetup').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'block';

    // Update basic game info
    updateBasicGameInfo();

    // Update all displays
    updateRoundDisplay();
    updatePlayersDisplay();
    updateHandDisplay();
    updateTrickDisplay();
    updateScoresDisplay();
    updateGameActions();
}

function updateBasicGameInfo() {
    // Update match ID for sharing
    const displayMatchId = document.getElementById('displayMatchId');
    if (displayMatchId && gameState.matchId) {
        displayMatchId.value = gameState.matchId.replace(/-/g, '');
    }

    // Update phase
    const phaseText = {
        0: 'Waiting for Players',
        1: 'Game In Progress',
        2: 'Round Ended',
        3: 'Game Ended'
    };
    const gamePhaseElement = document.getElementById('gamePhase');
    if (gamePhaseElement) {
        gamePhaseElement.textContent = phaseText[gameState.phase] || 'Unknown';
        gamePhaseElement.className = `phase-${Object.keys(phaseText)[gameState.phase] || 'unknown'}`.toLowerCase().replace(/ /g, '-');
    }

    // Update current player
    const currentPlayerElement = document.getElementById('currentPlayerName');
    if (currentPlayerElement && gameState.players && gameState.players.length > gameState.currentPlayerIndex) {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        currentPlayerElement.textContent = currentPlayer.name;
        currentPlayerElement.className = gameState.players[gameState.currentPlayerIndex]?.id === playerId ? 'current-turn-highlight' : '';
    }

    // Update trump suit
    const trumpElement = document.getElementById('trumpSuit');
    if (trumpElement) {
        if (gameState.selectedTrumpSuit) {
            const trumpSymbols = {
                'Hearts': '♥',
                'Diamonds': '♦',
                'Clubs': '♣',
                'Spades': '♠'
            };
            trumpElement.innerHTML = `<span class="trump-display ${gameState.selectedTrumpSuit.toLowerCase()}">
                ${trumpSymbols[gameState.selectedTrumpSuit]} ${gameState.selectedTrumpSuit}
            </span>`;
        } else {
            trumpElement.textContent = gameState.waitingForTrumpSelection ? 'Choosing...' : '-';
        }
    }
}