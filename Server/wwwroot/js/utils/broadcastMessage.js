// js/utils/broadcastMessage.js
// Broadcast a message to all players in the current match
import {connection, gameState} from "../core/variables.js";

export async function broadcastMessage(message) {
    if (!connection || !gameState || !gameState.matchId) {
        console.error("Cannot broadcast message: connection or match not available");
        return false;
    }

    try {
        await connection.invoke("BroadcastMessage", gameState.matchId, message);
        console.log("Message broadcasted successfully:", message);
        return true;
    } catch (err) {
        console.error("Failed to broadcast message:", err);
        return false;
    }
}