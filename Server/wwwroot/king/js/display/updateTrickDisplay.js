// Server/wwwroot/king/js/display/updateTrickDisplay.js
import { gameState } from "../core/variables.js";
import { getSuitSymbol } from "../../../js/cards/getSuitSymbol.js";
import { getSuitClass } from "../../../js/cards/getSuitClass.js";

export function updateTrickDisplay() {
    const trickCards = document.getElementById('trickCards');
    
    if (!trickCards) return;

    // Clear existing cards
    trickCards.innerHTML = '';

    if (!gameState?.currentTrick?.cards || gameState.currentTrick.cards.length === 0) {
        return; // No cards to display
    }

    // Display each card in the current trick as full-size cards
    gameState.currentTrick.cards.forEach((playedCard, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card animate-entry';
        
        // Add positioning class based on player position
        const playerIndex = gameState.players?.findIndex(p => p.id === playedCard.playerId) || 0;
        const positionClass = getPositionClass(playerIndex);
        cardElement.classList.add(positionClass);

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

        trickCards.appendChild(cardElement);
    });
}

function getPositionClass(playerIndex) {
    switch (playerIndex) {
        case 0: return 'from-top';
        case 1: return 'from-right';
        case 2: return 'from-bottom';
        case 3: return 'from-left';
        default: return 'from-top';
    }
}