// Server/wwwroot/king/js/actions/newGame.js
import { gameState, playerId } from "../core/variables.js";
import { storePlayerName } from "../../../js/utils/clientIdUtils.js";

export function newGame() {
    console.log("Starting new King game - returning to King main page");
    
    // Store current player name in cookie for next game
    const currentPlayer = gameState?.players?.find(p => p.id === playerId);
    if (currentPlayer?.name) {
        storePlayerName(currentPlayer.name);
    }
    
    // Redirect to King main page (using the new filename)
    window.location.href = '/king/king.html';
}