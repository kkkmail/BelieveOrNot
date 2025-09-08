// Server/wwwroot/king/js/display/updateMessageArea.js
import { gameState } from "../core/variables.js";

export function updateMessageArea() {
    const messageArea = document.getElementById('messageArea');
    
    if (!messageArea) return;

    if (!gameState) {
        messageArea.textContent = "Loading...";
        return;
    }

    // This is for broadcast messages only - similar to BelieveOrNot
    // Default message based on game state
    if (gameState.phase === 0) { // WaitingForPlayers
        const playerCount = gameState.players?.length || 0;
        if (playerCount < 4) {
            messageArea.textContent = `Welcome to The King! Wait for ${4 - playerCount} more players to join.`;
        } else {
            messageArea.textContent = "All players joined! Waiting for game to start.";
        }
    } 
    else if (gameState.phase === 1) { // InProgress
        messageArea.textContent = "Game in progress...";
    }
    else if (gameState.phase === 2) { // RoundEnd
        messageArea.textContent = "Round ended! Waiting for next round to start.";
    }
    else if (gameState.phase === 3) { // GameEnd
        messageArea.textContent = "Game finished! Thank you for playing.";
    }
    else {
        messageArea.textContent = "Game status unknown";
    }

    // Note: Broadcast messages from server will replace this content
    // This is just the default/fallback content
}