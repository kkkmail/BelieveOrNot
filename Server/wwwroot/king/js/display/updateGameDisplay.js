// Server/wwwroot/king/js/display/updateGameDisplay.js
import { gameState, playerId } from "../core/variables.js";
import { updatePlayersDisplay } from "./updatePlayersDisplay.js";
import { updateHandDisplay } from "./updateHandDisplay.js";
import { updateTrickDisplay } from "./updateTrickDisplay.js";
import { updateScoresDisplay } from "./updateScoresDisplay.js";
import { updateRoundDisplay } from "./updateRoundDisplay.js";
import { updateGameActions } from "./updateGameActions.js";
import { showTrumpSelectionModal } from "../utils/showTrumpSelectionModal.js";

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

    // Update card area visibility based on game state
    updateCardAreaVisibility();

    // Update all displays
    updateRoundDisplay();
    updatePlayersDisplay();
    updateHandDisplay();
    updateTrickDisplay();
    updateScoresDisplay();
    updateGameActions();

    // Check for trump selection requirement
    checkTrumpSelectionRequirement();
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
        currentPlayerElement.className = gameState.players[gameState.currentPlayerIndex]?.id === playerId ? 
            'current-player current-player-me' : 'current-player';
    }
}

function updateCardAreaVisibility() {
    console.log("=== updateCardAreaVisibility() CALLED ===");
    
    const handArea = document.querySelector('.hand-area');
    const trumpSelectionArea = document.getElementById('trumpSelectionArea');
    const roundInfoArea = document.getElementById('roundInfoArea');
    
    console.log("Elements found:");
    console.log("- handArea:", handArea);
    console.log("- trumpSelectionArea:", trumpSelectionArea);
    console.log("- roundInfoArea:", roundInfoArea);
    
    // Show card area only when the round has started (phase 1)
    // The Start Round button is in game-management-controls, not in hand area
    const shouldShowCardArea = gameState.players && 
                               gameState.players.length === 4 && 
                               gameState.phase === 1; // InProgress phase

    console.log("=== CARD AREA VISIBILITY DEBUG ===");
    console.log("gameState.players:", gameState.players);
    console.log("shouldShowCardArea:", shouldShowCardArea);
    console.log("players.length:", gameState.players?.length);
    console.log("phase:", gameState.phase);
    console.log("Logic: players.length === 4 && phase === 1");

    if (handArea) {
        console.log("Hand area current display style:", handArea.style.display);
        console.log("Hand area computed display:", window.getComputedStyle(handArea).display);
        
        if (shouldShowCardArea) {
            handArea.style.display = 'block';
            console.log("✅ SHOWING hand area - Round started with 4 players");
            console.log("Hand area display after setting to block:", handArea.style.display);
        } else {
            handArea.style.display = 'none';
            console.log("❌ HIDING hand area - Round not started or less than 4 players");
        }
    } else {
        console.error("❌ Hand area element not found!");
    }

    // Also hide trump selection area and round info area when card area is hidden
    if (trumpSelectionArea) {
        if (shouldShowCardArea) {
            // Trump selection visibility is controlled by other logic, so just remove forced hiding
            if (trumpSelectionArea.style.display === 'none') {
                trumpSelectionArea.style.display = '';
            }
            console.log("Trump selection area - removing forced hiding");
        } else {
            trumpSelectionArea.style.display = 'none';
            console.log("Trump selection area - hiding");
        }
    }

    if (roundInfoArea) {
        if (shouldShowCardArea) {
            roundInfoArea.style.display = 'block';
            console.log("Round info area - showing");
        } else {
            roundInfoArea.style.display = 'none';
            console.log("Round info area - hiding");
        }
    }
    
    console.log("=== updateCardAreaVisibility() COMPLETE ===");
}

function checkTrumpSelectionRequirement() {
    console.log("=== CHECKING TRUMP SELECTION REQUIREMENT ===");
    console.log("gameState.waitingForTrumpSelection:", gameState.waitingForTrumpSelection);
    console.log("gameState.phase:", gameState.phase);
    console.log("gameState.currentPlayerIndex:", gameState.currentPlayerIndex);
    console.log("playerId:", playerId);
    
    if (!gameState || !playerId) {
        console.log("No game state or player ID - skipping trump selection check");
        return;
    }

    // Only check for trump selection in InProgress phase
    if (gameState.phase !== 1) {
        console.log("Game not in progress - skipping trump selection check");
        return;
    }

    // Check if we're waiting for trump selection
    if (!gameState.waitingForTrumpSelection) {
        console.log("Not waiting for trump selection - skipping");
        return;
    }

    // Check if it's this player's turn to select trump
    const currentPlayer = gameState.players?.[gameState.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.id !== playerId) {
        console.log("Not this player's turn to select trump - current player:", currentPlayer?.name);
        return;
    }

    // Check if modal is already showing
    if (document.getElementById('trumpSelectionModalOverlay')) {
        console.log("Trump selection modal already showing - skipping");
        return;
    }

    // Show the trump selection modal
    console.log("✅ SHOWING TRUMP SELECTION MODAL - This player needs to choose trump");
    showTrumpSelectionModal();
}