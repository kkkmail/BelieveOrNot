// js/game/startRound.js
import { connection, gameState, playerId } from "../core/variables.js";

export async function startRound() {
    if (!gameState || !playerId) {
        alert('Cannot start round: game or player not found');
        return;
    }

    if (gameState.creatorPlayerId !== playerId) {
        alert('Only the game creator can start rounds');
        return;
    }

    if (!gameState.players || gameState.players.length !== 4) {
        alert('Need exactly 4 players to start');
        return;
    }

    try {
        await connection.invoke("StartRound", gameState.matchId, playerId);
        console.log("Round started successfully");
    } catch (err) {
        console.error("Failed to start round:", err);
        alert("Failed to start round: " + (err.message || err));
    }
}