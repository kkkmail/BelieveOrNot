// Server/wwwroot/king/js/actions/newGame.js
import { clearMatchIdFromUrl } from "../../../js/utils/urlManager.js";
import { gameState, playerId } from "../core/variables.js";
import { storePlayerName } from "../../../js/utils/clientIdUtils.js";

export function newGame() {
    console.log("Starting new King game - returning to main page");
    
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