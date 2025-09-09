// js/display/updateCardPileDisplay.js
import {gameState} from "../core/variables.js";

export function updateCardPileDisplay() {
    const cardPile = document.getElementById('cardPile');
    const pileCountDisplay = document.getElementById('pileCountDisplay');

    if (!gameState.tablePileCount || gameState.tablePileCount === 0) {
        cardPile.innerHTML = '<div style="color: #999; font-style: italic; margin-top: 40px;">Empty</div>';
        pileCountDisplay.textContent = '0 cards';
        return;
    }

    // Calculate how many cards are in the "pile" (total - last play)
    const lastPlayCount = gameState.lastPlayCardCount || gameState.LastPlayCardCount || 0;
    const pileCardCount = Math.max(0, gameState.tablePileCount - lastPlayCount);

    pileCountDisplay.textContent = pileCardCount + ' cards';

    if (pileCardCount === 0) {
        cardPile.innerHTML = '<div style="color: #999; font-style: italic; margin-top: 40px;">Empty</div>';
        return;
    }

    // Clear pile
    cardPile.innerHTML = '';

    // FIXED: Wait for container to render and get accurate width
    requestAnimationFrame(() => {
        const containerRect = cardPile.getBoundingClientRect();
        const containerWidth = containerRect.width - 10; // FIXED: Account for padding properly
        const cardWidth = 90;

        console.log('Container width:', containerWidth, 'Card width:', cardWidth);

        // Calculate total cards in deck
        let totalCardsInDeck = 52;
        if (gameState.deckSize || gameState.DeckSize) {
            totalCardsInDeck = gameState.deckSize || gameState.DeckSize;
        }
        if (gameState.jokerCount || gameState.JokerCount) {
            totalCardsInDeck += (gameState.jokerCount || gameState.JokerCount);
        }

        const maxPossiblePileCards = Math.max(totalCardsInDeck - 2, pileCardCount);

        // FIXED: Calculate spacing based on maxPossiblePileCards for consistency
        let cardSpacing = 4; // Minimum spacing
        if (maxPossiblePileCards > 1) {
            // Available space for spacing = container width - width of last card
            const availableWidth = containerWidth - cardWidth;
            if (availableWidth > 0) {
                cardSpacing = availableWidth / (maxPossiblePileCards - 1); // FIXED: Use maxPossiblePileCards
                cardSpacing = Math.max(cardSpacing, 2); // Minimum 2px
                cardSpacing = Math.min(cardSpacing, 15); // Maximum 15px
            }
        }

        console.log('Pile: ' + pileCardCount + '/' + maxPossiblePileCards + ' cards, spacing: ' + cardSpacing.toFixed(1) + 'px');

        // Create cards with corrected spacing
        for (let i = 0; i < pileCardCount; i++) {
            const cardBack = document.createElement('div');
            cardBack.className = 'card';
            cardBack.style.position = 'absolute';
            cardBack.style.left = (i * cardSpacing) + 'px'; // FIXED: Use actual calculated spacing
            cardBack.style.top = '5px';
            cardBack.style.zIndex = i.toString();
            cardBack.style.width = cardWidth + 'px';
            cardBack.style.height = '130px';

            cardBack.style.background = 'radial-gradient(circle at 30% 30%, rgba(116, 185, 255, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(187, 143, 206, 0.4) 0%, transparent 50%), linear-gradient(135deg, #9bb0c1 0%, #8299b5 50%, #9bb0c1 100%)';

            cardBack.innerHTML = '<div style="color: #34495e; opacity: 0.7; font-size: 20px; letter-spacing: 3px; text-shadow: 1px 1px 1px rgba(255,255,255,0.3);">♠♥♦♣</div>';

            cardPile.appendChild(cardBack);
        }
    });
}
