// Server/wwwroot/king/js/actions/endRound.js
import { connection, gameState, playerId } from "../core/variables.js";
import { customConfirm } from "../../../js/utils/customConfirm.js";

export async function endRound() {
    console.log("endRound called");

    if (!gameState) {
        alert('No active game found');
        return;
    }

    // Check if player is game creator
    const currentPlayer = gameState.players?.find(p => p.id === playerId);
    const isCreator = currentPlayer?.isCreator || (gameState.players && gameState.players[0]?.id === playerId);
    
    if (!isCreator) {
        alert('Only the game creator can end the round');
        return;
    }

    // Show confirmation dialog with correct title
    const confirmed = await customConfirm(
        `Are you sure you want to end the current round?\n\nThis round will not be counted in the final scores.`,
        'The King'  // Fixed title
    );

    if (!confirmed) {
        console.log("End round cancelled by user");
        return;
    }

    console.log("User confirmed end round, sending to server...");

    try {
        const endRoundRequest = {
            matchId: gameState.matchId,
            playerId: playerId
        };

        console.log("End round request:", endRoundRequest);

        await connection.invoke("EndRound", endRoundRequest);

        console.log("Round ended successfully");
        
    } catch (err) {
        console.error("Failed to end round:", err);
        alert("Failed to end round: " + (err.message || err));
    }
}