// js/actions/endRound.js
import { connection, gameState, playerId } from "../core/variables.js";
import { customConfirm } from "../utils/customConfirm.js";

export async function endRound() {
    if (!gameState || !playerId) {
        alert('Cannot end round: game or player not found');
        return;
    }

    if (gameState.creatorPlayerId !== playerId) {
        alert('Only the game creator can end the round');
        return;
    }

    if (gameState.phase !== 1) { // InProgress
        alert('No round is currently in progress');
        return;
    }

    const confirmed = await customConfirm(
        'Are you sure you want to end the current round?<br><br>' +
        'This will cancel the round without calculating any scores. ' +
        'All players will return to the lobby.',
        'End Round'
    );

    if (!confirmed) {
        return;
    }

    try {
        await connection.invoke("EndRound", gameState.matchId, playerId);
        console.log("Round ended successfully");
    } catch (err) {
        console.error("Failed to end round:", err);
        alert("Failed to end round: " + (err.message || err));
    }
}