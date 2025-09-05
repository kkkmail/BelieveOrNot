// js/cards/toggleCardSelection.js
import {gameState, selectedCards, playerId, setSelectedChallengeIndex} from "../core/variables.js";
import {updateActionsDisplay} from "../display/updateActionsDisplay.js";
import {updateHandDisplay} from "../display/updateHandDisplay.js";
import {showMessage} from "../utils/showMessage.js";

export function toggleCardSelection(cardIndex) {
    // Allow card selection during active game phase OR when it's not our turn (pre-selection)
    if (gameState && gameState.phase === 2) { // RoundEnd
        console.log("Card selection disabled: Round has ended");
        return; // Don't show message, just silently ignore
    }

    // Allow selection during game setup or when not our turn (for pre-selection)
    if (!gameState || (gameState.phase !== 1 && gameState.phase !== 0)) {
        console.log("Card selection disabled: Invalid game phase");
        return;
    }

    // If only 1 active player remains (others have 0 cards), disable card selection
    if (gameState && gameState.players && gameState.phase === 1) {
        const activePlayers = gameState.players.filter(p => p.handCount > 0);
        const playersWithNoCards = gameState.players.filter(p => p.handCount === 0);
        
        if (activePlayers.length === 1 && playersWithNoCards.length > 0) {
            // Only one active player left - they can only challenge, not play cards
            console.log("Card selection disabled: Only 1 active player remaining");
            
            // Format finished player names with HTML styling
            const finishedPlayerNames = playersWithNoCards
                .map(p => `<span style="font-weight: bold; font-style: italic;">${p.name}</span>`)
                .join(', ');
            
            // Show message to explain why they can't select cards
            showMessage(`You can only challenge now - ${finishedPlayerNames} finished the round!`, 0, false);
            return;
        }
    }

    // Clear any challenge selection when selecting cards to play
    setSelectedChallengeIndex(-1);

    const index = selectedCards.indexOf(cardIndex);
    if (index > -1) {
        selectedCards.splice(index, 1);
        console.log("Card deselected:", cardIndex);
    } else {
        if (selectedCards.length < 3) {
            selectedCards.push(cardIndex);
            console.log("Card selected:", cardIndex);
        } else {
            alert('You can only select up to 3 cards at a time');
            return;
        }
    }

    // Clear "played" flag when selection changes
    window.cardsJustPlayed = false;

    // Update display immediately
    updateHandDisplay();
    updateActionsDisplay(); // This now handles the card play preview message

    console.log('Selected cards:', selectedCards);
}