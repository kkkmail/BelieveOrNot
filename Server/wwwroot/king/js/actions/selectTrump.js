// js/actions/selectTrump.js
import { connection, gameState, playerId } from "../core/variables.js";

export async function selectTrump(suit) {
    if (!gameState || !playerId) {
        console.error('Cannot select trump: game or player not found');
        return;
    }

    if (!gameState.canSelectTrump) {
        console.error('Cannot select trump at this time');
        return;
    }

    try {
        await connection.invoke("SelectTrump", {
            matchId: gameState.matchId,
            playerId: playerId,
            trump: suit
        });
        console.log("Trump selected successfully:", suit);
    } catch (err) {
        console.error("Failed to select trump:", err);
        alert("Failed to select trump: " + (err.message || err));
    }
}