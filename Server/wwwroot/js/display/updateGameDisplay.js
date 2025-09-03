import {gameState, setSelectedCards} from "../core/variables.js";
import {updateScoresDisplay} from "./updateScoresDisplay.js";
import {updateActionsDisplay} from "./updateActionsDisplay.js";
import {updateHandDisplay} from "./updateHandDisplay.js";
import {updatePlayersDisplay} from "./updatePlayersDisplay.js";
import {updateRankDropdown} from "../utils/updateRankDropdown.js";
import {updateTablePileDisplay} from "./updateTablePileDisplay.js";

export function updateGameDisplay() {
    if (!gameState) return;

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

    // Update rank dropdown based on game settings
    updateRankDropdown();

    // Update players display
    updatePlayersDisplay();

    // Update hand
    updateHandDisplay();

    // Update actions (this handles start button display)
    updateActionsDisplay();

    // Update scores
    updateScoresDisplay();

    // REMOVED the old start button logic from here since it's now handled in updateActionsDisplay

    // Clear any lingering card selections after state update (but preserve valid selections)
    // Only clear if game phase changed to non-active
    if (gameState.phase !== 1) {
        setSelectedCards([]);
    }
}
