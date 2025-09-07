// Server/wwwroot/king/js/actions/playCard.js
import { connection, gameState, playerId, selectedCard, setSelectedCard } from "../core/variables.js";
import { customConfirm } from "../../../js/utils/customConfirm.js";
import { updateHandDisplay } from "../display/updateHandDisplay.js";
import { updateGameActions } from "../display/updateGameActions.js";

export async function playCard() {
    console.log("playCard called, selectedCard:", selectedCard);

    if (selectedCard === null) {
        alert('Please select a card to play');
        return;
    }

    // Get the selected card details
    const card = gameState.yourHand?.[selectedCard];
    if (!card) {
        alert('Selected card not found');
        return;
    }

    // Format card name for confirmation dialog
    const cardName = `<span style="font-weight: bold; font-size: 1.2em;">${card.rank} of ${card.suit}</span>`;

    // Show confirmation dialog (BelieveOrNot pattern)
    const confirmed = await customConfirm(
        `Are you sure you want to play ${cardName}?`,
        'Play Card'
    );

    if (!confirmed) {
        console.log("Card play cancelled by user");
        return;
    }

    console.log("User confirmed card play, sending to server...");

    try {
        const playRequest = {
            matchId: gameState.matchId,
            playerId: playerId,
            card: card
        };

        console.log("Play card request:", playRequest);

        await connection.invoke("PlayCard", playRequest);

        console.log("Card played successfully");
        
        // Clear selection after successful play
        setSelectedCard(null);
        updateHandDisplay();
        updateGameActions();
        
    } catch (err) {
        console.error("Failed to play card:", err);
        alert("Failed to play card: " + (err.message || err));
    }
}