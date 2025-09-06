// js/actions/playCard.js
import { connection, gameState, playerId } from "../core/variables.js";

export async function playCard(card) {
    if (!gameState || !playerId) {
        console.error('Cannot play card: game or player not found');
        return;
    }

    if (gameState.phase !== 1) {
        console.error('Cannot play card: not in game phase');
        return;
    }

    if (gameState.currentPlayerIndex !== getMyPlayerIndex()) {
        console.error('Cannot play card: not your turn');
        return;
    }

    try {
        await connection.invoke("PlayCard", {
            matchId: gameState.matchId,
            playerId: playerId,
            card: card
        });
        console.log("Card played successfully:", card);
    } catch (err) {
        console.error("Failed to play card:", err);
        alert("Failed to play card: " + (err.message || err));
    }
}

function getMyPlayerIndex() {
    if (!gameState.players || !playerId) return -1;
    return gameState.players.findIndex(p => p.id === playerId);
}