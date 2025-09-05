// js/actions/endGame.js
import { connection, gameState, playerId } from "../core/variables.js";
import { customConfirm } from "../utils/customConfirm.js";

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

    // Show current scores in confirmation with HTML formatting
    const currentScores = gameState.players
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .map((p, i) => {
            const formattedName = `<span style="font-weight: bold; font-style: italic;">${p.name}</span>`;
            const formattedScore = `<span style="font-weight: bold; color: ${p.score >= 0 ? '#28a745' : '#dc3545'};">${p.score}</span>`;
            return `${i + 1}. ${formattedName}: ${formattedScore} points`;
        })
        .join('<br>');

    const confirmed = await customConfirm(
        'Are you sure you want to end the game?<br><br>' +
        '<strong>Current standings:</strong><br>' + currentScores + '<br><br>' +
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