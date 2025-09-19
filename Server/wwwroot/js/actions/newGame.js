// js/actions/newGame.js
import { clearMatchIdFromUrl } from "../utils/urlManager.js";
import { gameState, playerId } from "../core/variables.js";
import { storePlayerName } from "../utils/playerIdUtils.js";

export function newGame() {
    console.log("Starting new game - returning to main page");

    // Store current player name in cookie for next game
    const currentPlayer = gameState?.players?.find(p => p.id === playerId);
    if (currentPlayer?.name) {
        storePlayerName(currentPlayer.name);
    }

    // Clear match ID from URL
    clearMatchIdFromUrl();

    // Reload the page to start fresh
    window.location.reload();
}
