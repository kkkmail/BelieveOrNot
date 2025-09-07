// Server/wwwroot/king/js/utils/reconnectionHandler.js
import { getOrCreateClientId } from "../../../js/utils/clientIdUtils.js";
import { getMatchIdFromUrl } from "../../../js/utils/urlManager.js";
import { connection, setGameState, setCurrentMatch, setPlayerId } from "../core/variables.js";
import { updateGameDisplay } from "../display/updateGameDisplay.js";
import { showGameBoard } from "./showGameBoard.js";
import { customAlert } from "../../../js/utils/customAlert.js";

export async function attemptReconnection() {
    const matchId = getMatchIdFromUrl();
    const clientId = getOrCreateClientId();
    
    if (!matchId) {
        console.log('No match ID in URL for King game, showing setup form');
        return false;
    }

    console.log('Attempting King reconnection to match:', matchId, 'with client ID:', clientId);

    try {
        const result = await connection.invoke("ReconnectToMatch", matchId, clientId);
        
        if (result.success) {
            console.log('King reconnection successful:', result);
            
            setCurrentMatch(result.match);
            setGameState(result.gameState);
            setPlayerId(result.playerId);
            
            showGameBoard();
            updateGameDisplay();
            
            console.log('🔄 Reconnected to King game successfully!');
            
            return true;
        } else {
            console.log('King reconnection failed:', result.message);
            await customAlert(result.message, 'Reconnection Failed');
            return false;
        }
    } catch (err) {
        console.error('King reconnection error:', err);
        
        if (err.message.includes('Match not found')) {
            await customAlert('The King game you were trying to rejoin no longer exists or has ended.', 'Game Not Found');
        } else if (err.message.includes('Game already started')) {
            await customAlert('This King game has already started and new players cannot join.', 'Game Started');
        } else {
            await customAlert('Could not reconnect to the King game. You can create a new game or join a different one.', 'Reconnection Failed');
        }
        
        return false;
    }
}

export function handleDisconnection() {
    console.log('King connection lost - user will see disconnected status');
}

export function handleReconnection() {
    console.log('King connection restored');
    
    // Attempt to rejoin the match if we have one
    const matchId = getMatchIdFromUrl();
    if (matchId) {
        setTimeout(() => {
            attemptReconnection();
        }, 1000);
    }
}