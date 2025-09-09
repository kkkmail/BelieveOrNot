// js/game/startRound.js
// Start a new round
import {connection, currentMatch, playerId} from "../core/variables.js";

export async function startRound() {
    if (!currentMatch || !playerId) {
        alert('Cannot start round: match or player not found');
        return;
    }

    // Clear stored message and interaction state when starting a new round
    window.lastPlayedMessage = null;
    window.playerInteractionState = false;

    try {
        await connection.invoke("StartRound", currentMatch.matchId, playerId);
    } catch (err) {
        console.error("Failed to start round:", err);
        alert("Failed to start round: " + err);
    }
}
