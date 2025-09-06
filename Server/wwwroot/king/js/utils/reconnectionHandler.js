// js/utils/reconnectionHandler.js
import { getOrCreateClientId } from "../../../js/utils/clientIdUtils.js"; // Reuse from BelieveOrNot
import { getMatchIdFromUrl } from "./urlManager.js";
import { connection, setGameState, setCurrentMatch, setPlayerId } from "../core/variables.js";
import { updateGameDisplay } from "../display/updateGameDisplay.js";
import { showGameBoard } from "../game/showGameBoard.js";
import { showMessage } from "../../../js/utils/showMessage.js"; // Reuse from BelieveOrNot

export async function attemptReconnection() {
    const matchId = getMatchIdFromUrl();
    const clientId = getOrCreateClientId();
    
    if (!matchId) {
        console.log('No match ID in URL, showing setup form');
        return false;
    }

    console.log('Attempting King reconnection to match:', matchId, 'with client ID:', clientId);

    try {
        const result = await connection.invoke("ReconnectToMatch", {
            matchId: matchId,
            clientId: clientId
        });
        
        if (result.success) {
            console.log('King reconnection successful:', result);
            
            setCurrentMatch(result.match);
            setGameState(result.gameState);
            setPlayerId(result.playerId);
            
            showGameBoard();
            updateGameDisplay();
            
            showMessage(`Reconnected to King game successfully!`);
            
            return true;
        } else {
            console.log('King reconnection failed:', result.message);
            alert(result.message);
            return false;
        }
    } catch (err) {
        console.error('King reconnection error:', err);
        alert('Could not reconnect to the King game. You can create a new game or join a different one.');
        return false;
    }
}