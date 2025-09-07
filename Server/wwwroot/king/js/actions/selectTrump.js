// Server/wwwroot/king/js/actions/selectTrump.js
import { connection, gameState, playerId } from "../core/variables.js";
import { customAlert } from "../../../js/utils/customAlert.js";

export async function selectTrump(trumpSuit) {
    if (!gameState || !playerId) {
        await customAlert('Cannot select trump: game or player not found');
        return;
    }

    if (!trumpSuit) {
        await customAlert('No trump suit selected');
        return;
    }

    console.log("Selecting trump suit:", trumpSuit);

    try {
        const trumpRequest = {
            matchId: gameState.matchId,
            playerId: playerId,
            trumpSuit: trumpSuit
        };

        console.log("Trump selection request:", trumpRequest);

        await connection.invoke("SelectTrump", trumpRequest);
        
        console.log("Trump selected successfully:", trumpSuit);
    } catch (err) {
        console.error("Failed to select trump:", err);
        await customAlert("Failed to select trump: " + (err.message || err));
    }
}