// Server/wwwroot/king/js/actions/selectTrump.js
import { connection, gameState, playerId, setSelectedTrumpSuit } from "../core/variables.js";
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

    try {
        await connection.invoke("SelectTrump", {
            matchId: gameState.matchId,
            playerId: playerId,
            trumpSuit: trumpSuit
        });
        
        // Clear selected trump after successful selection
        setSelectedTrumpSuit(null);
        console.log("Trump selected successfully:", trumpSuit);
    } catch (err) {
        console.error("Failed to select trump:", err);
        await customAlert("Failed to select trump: " + err);
    }
}