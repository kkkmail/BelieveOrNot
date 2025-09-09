// Server/wwwroot/king/js/actions/playCard.js
import { connection, gameState, playerId, selectedCard, setSelectedCard } from "../core/variables.js";
import { updateHandDisplay } from "../display/updateHandDisplay.js";
import { updateGameActions } from "../display/updateGameActions.js";
import { addToEventHistory } from "../utils/addToEventHistory.js";

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

    console.log("Playing card without confirmation:", card);

    try {
        const playRequest = {
            matchId: gameState.matchId,
            playerId: playerId,
            card: card
        };

        console.log("Play card request:", playRequest);

        // Check if this will be the 4th card (trick complete)
        const currentTrickCardCount = gameState.currentTrick?.cards?.length || 0;
        const willCompleteTrick = currentTrickCardCount === 3; // Will be 4 after our card

        // If this will complete the trick, disable cards IMMEDIATELY
        if (willCompleteTrick) {
            console.log("This will be the 4th card - disabling cards immediately");
            window.trickCompletionInProgress = true;
        }

        await connection.invoke("PlayCard", playRequest);

        console.log("Card played successfully");
        
        // Add test messages to verify messaging system
        const playerName = gameState.players?.find(p => p.id === playerId)?.name || "You";
        const cardText = `<span style="font-weight: bold; color: #007bff;">${card.rank} of ${card.suit}</span>`;
        
        // Test multiple messages
        addToEventHistory(`🃏 <span style="font-weight: bold; font-style: italic;">${playerName}</span> played ${cardText}`);
        
        // Add more test messages to check 8-message limit
        setTimeout(() => {
            addToEventHistory(`✅ Card play successful`);
        }, 500);
        
        setTimeout(() => {
            addToEventHistory(`🎯 Turn progressing...`);
        }, 1000);
        
        setTimeout(() => {
            addToEventHistory(`📊 Game state updated`);
        }, 1500);
        
        // Clear selection after successful play
        setSelectedCard(null);
        
        // Reset interaction state to allow blinking again
        window.playerInteractionState = false;
        
        updateHandDisplay();
        updateGameActions();
        
    } catch (err) {
        console.error("Failed to play card:", err);
        alert("Failed to play card: " + (err.message || err));
        
        // Reset flag if there was an error
        window.trickCompletionInProgress = false;
    }
}