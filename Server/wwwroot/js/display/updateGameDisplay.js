// js/display/updateGameDisplay.js
import {gameState, setSelectedCards} from "../core/variables.js";
import {updateScoresDisplay} from "./updateScoresDisplay.js";
import {updateActionsDisplay} from "./updateActionsDisplay.js";
import {updateHandDisplay} from "./updateHandDisplay.js";
import {updatePlayersDisplay} from "./updatePlayersDisplay.js";
import {updateRankButtons, clearRankSelection} from "../utils/updateRankButtons.js";
import {updateTablePileDisplay} from "./updateTablePileDisplay.js";

export function updateGameDisplay() {
    if (!gameState) {
        // On home page (no game state), update actions to show Other Games button
        updateActionsDisplay();
        return;
    }

    // Store previous play info BEFORE updating display (for challenge animation)
    const previousPlayCards = document.getElementById('previousPlayCards');
    if (previousPlayCards && previousPlayCards.children.length > 0 && gameState.lastPlayCardCount === 0) {
        // Game state shows no last play but we have cards displayed - store them for potential animation
        console.log("🎯 Storing previous play cards for potential challenge animation");
        window.storedPreviousPlayCards = Array.from(previousPlayCards.children).map(card => ({
            element: card.cloneNode(true),
            index: Array.from(previousPlayCards.children).indexOf(card)
        }));
        window.storedPreviousPlayInfo = document.getElementById('playInfoDisplay')?.innerHTML || '';
    }

    // Update basic game info
    document.getElementById('roundNumber').textContent = gameState.roundNumber;
    document.getElementById('announcedRank').textContent = gameState.announcedRank || '-';
    document.getElementById('tablePileCount').textContent = gameState.tablePileCount;

    // Remove hyphens from match ID for easier reading/sharing
    document.getElementById('displayMatchId').value = gameState.matchId.replace(/-/g, '');

    // Update table pile display
    updateTablePileDisplay();

    // Update current player
    if (gameState.players && gameState.players.length > gameState.currentPlayerIndex) {
        document.getElementById('currentPlayerName').textContent =
            gameState.players[gameState.currentPlayerIndex].name;
    }

    // Update phase
    const phaseText = {
        0: 'Waiting for Players',
        1: 'Game In Progress',
        2: 'Round Ended',
        3: 'Game Ended'
    };
    document.getElementById('gamePhase').textContent = phaseText[gameState.phase] || 'Unknown';

    // Update rank buttons based on game settings
    updateRankButtons();

    // Update players display
    updatePlayersDisplay();

    // Update hand
    updateHandDisplay();

    // IMPORTANT: Update actions display when we have game state
    updateActionsDisplay();

    // Update scores
    updateScoresDisplay();

    // Clear any lingering card selections after state update (but preserve valid selections)
    // Only clear if game phase changed to non-active
    if (gameState.phase !== 1) {
        setSelectedCards([]);
        clearRankSelection();
        // Clear preview when round/game ends
        window.cardsJustPlayed = false;
    }
}
