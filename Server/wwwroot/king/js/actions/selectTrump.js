// Server/wwwroot/king/js/actions/selectTrump.js
import { connection, gameState, playerId } from "../core/variables.js";
import { customAlert } from "../../../js/utils/customAlert.js";
import { closeTrumpSelectionModal } from "../utils/showTrumpSelectionModal.js";
import { updateTrumpDisplay } from "../display/updateTrumpDisplay.js";

// Convert suit name to enum value
function getSuitEnumValue(suitName) {
    switch(suitName) {
        case 'Spades': return 0;
        case 'Clubs': return 1;
        case 'Diamonds': return 2;
        case 'Hearts': return 3;
        default: throw new Error(`Unknown suit: ${suitName}`);
    }
}

export async function selectTrump(trumpSuit) {
    console.log("=== SELECT TRUMP ACTION CALLED ===");
    console.log("trumpSuit parameter:", trumpSuit);

    if (!gameState || !playerId) {
        await customAlert('Cannot select trump: game or player not found');
        return;
    }

    if (!trumpSuit) {
        await customAlert('No trump suit selected');
        return;
    }

    console.log("=== SELECT TRUMP DEBUG INFO ===");
    console.log("gameState.matchId:", gameState.matchId);
    console.log("playerId:", playerId);
    console.log("trumpSuit:", trumpSuit);
    console.log("gameState.waitingForTrumpSelection:", gameState.waitingForTrumpSelection);
    console.log("gameState.currentPlayerIndex:", gameState.currentPlayerIndex);
    console.log("gameState.players[currentPlayerIndex]:", gameState.players?.[gameState.currentPlayerIndex]);
    console.log("connection status:", connection?.state);

    console.log("Selecting trump suit:", trumpSuit);

    try {
        // Convert suit string to enum value
        const trumpSuitEnum = getSuitEnumValue(trumpSuit);
        console.log("Converted suit to enum value:", trumpSuitEnum);

        const trumpRequest = {
            matchId: gameState.matchId,
            playerId: playerId,
            trumpSuit: trumpSuitEnum
        };

        console.log("Trump selection request:", trumpRequest);
        console.log("Request object type check:");
        console.log("- matchId type:", typeof trumpRequest.matchId, "value:", trumpRequest.matchId);
        console.log("- playerId type:", typeof trumpRequest.playerId, "value:", trumpRequest.playerId);
        console.log("- trumpSuit type:", typeof trumpRequest.trumpSuit, "value:", trumpRequest.trumpSuit);

        console.log("About to invoke SelectTrump with request:", JSON.stringify(trumpRequest, null, 2));

        await connection.invoke("SelectTrump", trumpRequest);

        console.log("Trump selected successfully:", trumpSuit);
        updateTrumpDisplay(trumpSuit);

        // Close the modal if it's open
        closeTrumpSelectionModal();

    } catch (err) {
        console.error("=== TRUMP SELECTION ERROR ===");
        console.error("Error object:", err);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("Connection state:", connection?.state);
        console.error("Failed to select trump:", err);
        await customAlert("Failed to select trump: " + (err.message || err));
    }
}
