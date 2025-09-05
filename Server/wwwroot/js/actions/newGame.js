// js/actions/newGame.js
import { clearMatchIdFromUrl } from "../utils/urlManager.js";
import { gameState, playerId } from "../core/variables.js";

export function newGame() {
    console.log("Starting new game - returning to main page");
    
    // Store current player name to prefill after reload
    const currentPlayer = gameState?.players?.find(p => p.id === playerId);
    if (currentPlayer?.name) {
        localStorage.setItem('lastPlayerName', currentPlayer.name);
    }
    
    // Clear match ID from URL
    clearMatchIdFromUrl();
    
    // Reload the page to start fresh
    window.location.reload();
}