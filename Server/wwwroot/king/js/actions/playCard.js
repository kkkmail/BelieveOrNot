// Server/wwwroot/king/js/actions/playCard.js
import { connection, gameState, playerId, selectedCard, setSelectedCard } from "../core/variables.js";
import { customAlert } from "../../../js/utils/customAlert.js";

export async function playCard(card) {
    if (!gameState || !playerId) {
        await customAlert('Cannot play card: game or player not found');
        return;
    }

    if (!card) {
        await customAlert('No card selected');
        return;
    }

    try {
        await connection.invoke("PlayCard", {
            matchId: gameState.matchId,
            playerId: playerId,
            card: card
        });
        
        // Clear selected card after successful play
        setSelectedCard(null);
        console.log("Card played successfully:", card);
    } catch (err) {
        console.error("Failed to play card:", err);
        await customAlert("Failed to play card: " + err);
    }
}