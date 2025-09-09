// Server/wwwroot/king/js/display/updateTrickDisplay.js
import { gameState } from "../core/variables.js";
import { getSuitSymbol } from "../../../js/cards/getSuitSymbol.js";
import { getSuitClass } from "../../../js/cards/getSuitClass.js";
import { updateHandDisplay } from "./updateHandDisplay.js";

export function updateTrickDisplay() {
    // Clear all card slots first
    for (let i = 0; i < 4; i++) {
        const slot = document.getElementById(`cardSlot${i}`);
        if (slot) {
            slot.innerHTML = '';
            slot.classList.remove('has-card');
        }
    }

    // Check if we should clear the trick completion flag
    if (!gameState?.currentTrick?.cards || gameState.currentTrick.cards.length === 0) {
        // New trick started - clear the flag and update display
        if (window.trickCompletionInProgress) {
            console.log("New trick started - clearing trickCompletionInProgress flag");
            window.trickCompletionInProgress = false;
            // Update hand display immediately to re-enable cards
            setTimeout(() => updateHandDisplay(), 50);
        }
        return; // No cards to display
    }

    // Display each card in its corresponding player slot
    gameState.currentTrick.cards.forEach((playedCard) => {
        const playerIndex = gameState.players?.findIndex(p => p.id === playedCard.playerId);
        if (playerIndex === undefined || playerIndex === -1) return;

        const slot = document.getElementById(`cardSlot${playerIndex}`);
        if (!slot) return;

        // Create card element with same styling as hand cards
        const cardElement = document.createElement('div');
        cardElement.className = 'card animate-entry';

        const suitSymbol = getSuitSymbol(playedCard.card.suit);
        const suitClass = getSuitClass(playedCard.card.suit);

        cardElement.innerHTML = `
            <div class="rank ${suitClass}">${playedCard.card.rank}</div>
            <div class="suit ${suitClass}">${suitSymbol}</div>
        `;

        // Add trump indicator if this is a trump card
        if (gameState.selectedTrumpSuit && playedCard.card.suit === gameState.selectedTrumpSuit) {
            cardElement.classList.add('trump-card');
            cardElement.style.borderColor = '#ffd700';
            cardElement.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
        }

        // Add card to slot and mark slot as having a card
        slot.appendChild(cardElement);
        slot.classList.add('has-card');
    });
}