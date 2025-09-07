// Server/wwwroot/king/js/display/updateHandDisplay.js
import { gameState, playerId, selectedCard, setSelectedCard } from "../core/variables.js";
import { getSuitSymbol } from "../../../js/cards/getSuitSymbol.js";
import { getSuitClass } from "../../../js/cards/getSuitClass.js";
import { playCard } from "../actions/playCard.js";

export function updateHandDisplay() {
    const handCards = document.getElementById('handCards');
    const handCount = document.getElementById('handCount');
    
    if (!handCards || !handCount) return;
    
    handCards.innerHTML = '';

    if (!gameState?.yourHand) {
        handCount.textContent = '0';
        return;
    }

    // Sort cards by suit and rank for consistent display
    const sortedHand = [...gameState.yourHand].sort((a, b) => {
        const suitOrder = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
        const rankOrder = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        
        const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
        if (suitDiff !== 0) return suitDiff;
        
        return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });

    handCount.textContent = sortedHand.length;

    sortedHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${getSuitClass(card.suit)}`;

        cardElement.innerHTML = `
            <div class="rank">${card.rank}</div>
            <div class="suit">${getSuitSymbol(card.suit)}</div>
        `;

        // Check if card is playable
        const isMyTurn = gameState.phase === 1 && 
                        gameState.players && 
                        gameState.players[gameState.currentPlayerIndex]?.id === playerId;
        
        const canPlayCard = isMyTurn && !gameState.waitingForTrumpSelection;

        if (canPlayCard) {
            cardElement.classList.add('playable');
            cardElement.addEventListener('click', () => {
                if (selectedCard && selectedCard.rank === card.rank && selectedCard.suit === card.suit) {
                    // Deselect if clicking the same card
                    setSelectedCard(null);
                    cardElement.classList.remove('selected');
                } else {
                    // Clear previous selection
                    document.querySelectorAll('.hand-cards .card.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    
                    // Select this card
                    setSelectedCard(card);
                    cardElement.classList.add('selected');
                    
                    // Auto-play the card (King is auto-play on click)
                    playCard(card);
                }
            });
        }

        // Show selection state
        if (selectedCard && selectedCard.rank === card.rank && selectedCard.suit === card.suit) {
            cardElement.classList.add('selected');
        }

        handCards.appendChild(cardElement);
    });
}