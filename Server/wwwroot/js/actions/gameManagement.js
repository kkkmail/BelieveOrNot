// js/actions/gameManagement.js
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
        'Are you sure you want to end the current round?\n\n' +
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

export async function endGame() {
    if (!gameState || !playerId) {
        alert('Cannot end game: game or player not found');
        return;
    }

    if (gameState.creatorPlayerId !== playerId) {
        alert('Only the game creator can end the game');
        return;
    }

    if (gameState.phase === 1) { // InProgress
        alert('Cannot end game while a round is in progress. Please end the round first.');
        return;
    }

    // Show current scores in confirmation
    const currentScores = gameState.players
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .map((p, i) => `${i + 1}. ${p.name}: ${p.score} points`)
        .join('\n');

    const confirmed = await customConfirm(
        'Are you sure you want to end the game?\n\n' +
        'Current standings:\n' + currentScores + '\n\n' +
        'Final results will be calculated and displayed.',
        'End Game'
    );

    if (!confirmed) {
        return;
    }

    try {
        await connection.invoke("EndGame", gameState.matchId, playerId);
        console.log("Game ended successfully");
    } catch (err) {
        console.error("Failed to end game:", err);
        alert("Failed to end game: " + (err.message || err));
    }
}