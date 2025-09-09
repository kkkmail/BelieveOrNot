// Server/wwwroot/king/js/cards/toggleCardSelection.js
import { gameState, selectedCard, setSelectedCard, playerId } from "../core/variables.js";
import { updateHandDisplay } from "../display/updateHandDisplay.js";
import { updateGameActions } from "../display/updateGameActions.js";
import { KingMoveValidator } from "../utils/KingMoveValidator.js";

export function toggleCardSelection(cardIndex) {
    console.log("=== TOGGLE CARD SELECTION ===");
    console.log("cardIndex:", cardIndex);
    console.log("current selectedCard:", selectedCard);
    console.log("gameState.phase:", gameState?.phase);
    console.log("waitingForTrumpSelection:", gameState?.waitingForTrumpSelection);
    console.log("playerId from import:", playerId);
    console.log("typeof playerId:", typeof playerId);

    // Check if trick completion is in progress
    if (window.trickCompletionInProgress) {
        console.log("Card selection disabled: Trick completion in progress");
        return;
    }

    // Check if game is in valid state for card selection
    if (!gameState || gameState.phase !== 1) { // Not in progress
        console.log("Card selection disabled: Game not in progress, phase:", gameState?.phase);
        return;
    }

    // Check if waiting for trump selection
    if (gameState.waitingForTrumpSelection) {
        console.log("Card selection disabled: Waiting for trump selection");
        return;
    }

    // Get the card being selected (use original order from server)
    const card = gameState.yourHand?.[cardIndex];
    if (!card) {
        console.log("Card selection failed: Card not found at index", cardIndex);
        return;
    }

    console.log("Card being selected:", card);

    // Check if this card can be played
    const canPlay = KingMoveValidator.canPlayCard(gameState, card, playerId);
    console.log("Can play this card:", canPlay);
    
    if (!canPlay) {
        console.log("Card selection disabled: Card cannot be played");
        return;
    }

    // Toggle selection
    if (selectedCard === cardIndex) {
        setSelectedCard(null); // Deselect
        console.log("Card deselected:", cardIndex);
    } else {
        setSelectedCard(cardIndex); // Select new card
        console.log("Card selected:", cardIndex);
    }

    // Update displays
    updateHandDisplay();
    updateGameActions();
    
    console.log("Card selection changed - selectedCard:", selectedCard);
}