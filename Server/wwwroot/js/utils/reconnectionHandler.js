// js/utils/reconnectionHandler.js
import { getOrCreateClientId } from "./clientIdUtils.js";
import { getMatchIdFromUrl, setMatchIdInUrl } from "./urlManager.js";
import { connection, setGameState, setCurrentMatch, setPlayerId } from "../core/variables.js";
import { updateGameDisplay } from "../display/updateGameDisplay.js";
import { showGameBoard } from "../game/showGameBoard.js";
import { addToEventHistory } from "./addToEventHistory.js";
import { customAlert } from "./customAlert.js";

export async function attemptReconnection() {
    const matchId = getMatchIdFromUrl();
    const clientId = getOrCreateClientId();
    
    if (!matchId) {
        console.log('No match ID in URL, showing setup form');
        return false;
    }

    console.log('Attempting reconnection to match:', matchId, 'with client ID:', clientId);

    try {
        const result = await connection.invoke("ReconnectToMatch", matchId, clientId);
        
        if (result.success) {
            console.log('Reconnection successful:', result);
            
            setCurrentMatch(result.match);
            setGameState(result.gameState);
            setPlayerId(result.playerId);
            
            showGameBoard();
            updateGameDisplay();
            
            addToEventHistory(`🔄 Reconnected to game successfully!`);
            
            return true;
        } else {
            console.log('Reconnection failed:', result.message);
            await customAlert(result.message, 'Reconnection Failed');
            return false;
        }
    } catch (err) {
        console.error('Reconnection error:', err);
        
        if (err.message.includes('Match not found')) {
            await customAlert('The game you were trying to rejoin no longer exists or has ended.', 'Game Not Found');
        } else if (err.message.includes('Game already started')) {
            await customAlert('This game has already started and new players cannot join.', 'Game Started');
        } else {
            await customAlert('Could not reconnect to the game. You can create a new game or join a different one.', 'Reconnection Failed');
        }
        
        return false;
    }
}

export function handleDisconnection() {
    console.log('Connection lost - user will see disconnected status');
    addToEventHistory('⚠️ Connection lost! Attempting to reconnect...');
}

export function handleReconnection() {
    console.log('Connection restored');
    addToEventHistory('✅ Connection restored!');
    
    // Attempt to rejoin the match if we have one
    const matchId = getMatchIdFromUrl();
    if (matchId) {
        setTimeout(() => {
            attemptReconnection();
        }, 1000);
    }
}