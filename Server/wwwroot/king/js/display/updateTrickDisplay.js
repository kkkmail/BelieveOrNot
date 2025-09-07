// Server/wwwroot/king/js/display/updateTrickDisplay.js
import { gameState } from "../core/variables.js";
import { getSuitSymbol } from "../../../js/cards/getSuitSymbol.js";
import { getSuitClass } from "../../../js/cards/getSuitClass.js";

export function updateTrickDisplay() {
    const trickCards = document.getElementById('trickCards');
    const trickInfo = document.getElementById('trickInfo');
    
    if (!trickCards || !trickInfo) return;

    trickCards.innerHTML = '';

    if (!gameState?.currentTrick || !gameState.currentTrick.cards || gameState.currentTrick.cards.length === 0) {
        trickInfo.textContent = 'No trick in progress';
        return;
    }

    const trick = gameState.currentTrick;
    
    // Display cards in the current trick
    trick.cards.forEach((playedCard, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${getSuitClass(playedCard.card.suit)}`;

        cardElement.innerHTML = `
            <div class="rank">${playedCard.card.rank}</div>
            <div class="suit">${getSuitSymbol(playedCard.card.suit)}</div>
        `;

        trickCards.appendChild(cardElement);
    });

    // Update trick info
    const trickNumber = trick.trickNumber || 1;
    const cardsInTrick = trick.cards.length;
    const ledSuit = trick.ledSuit ? getSuitSymbol(trick.ledSuit) + ' ' + trick.ledSuit : 'None';
    
    trickInfo.innerHTML = `
        Trick ${trickNumber} (${cardsInTrick}/4 cards)<br>
        Led suit: ${ledSuit}
    `;

    // Show trump indicator if trump is set
    const trumpIndicator = document.querySelector('.trump-indicator');
    if (gameState.selectedTrumpSuit) {
        if (!trumpIndicator) {
            const indicator = document.createElement('div');
            indicator.className = 'trump-indicator';
            document.querySelector('.table-center').appendChild(indicator);
        }
        
        const indicator = document.querySelector('.trump-indicator');
        const trumpSymbol = getSuitSymbol(gameState.selectedTrumpSuit);
        indicator.innerHTML = `
            <span class="trump-symbol">${trumpSymbol}</span>
            Trump: ${gameState.selectedTrumpSuit}
        `;
    } else if (trumpIndicator) {
        trumpIndicator.remove();
    }
}