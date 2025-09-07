// Server/wwwroot/king/js/display/updateHandDisplay.js
import { gameState, playerId, selectedCard } from "../core/variables.js";
import { getSuitSymbol } from "../../../js/cards/getSuitSymbol.js";
import { getSuitClass } from "../../../js/cards/getSuitClass.js";
import { toggleCardSelection } from "../cards/toggleCardSelection.js";
import { KingMoveValidator } from "../utils/KingMoveValidator.js";

export function updateHandDisplay() {
    const handCards = document.getElementById('handCards');
    const handCount = document.getElementById('handCount');

    if (!gameState?.yourHand) {
        handCards.innerHTML = '<div class="no-cards">No cards in hand</div>';
        handCount.textContent = '0';
        return;
    }

    handCount.textContent = gameState.yourHand.length;
    handCards.innerHTML = '';

    // Get current player info
    const currentPlayer = gameState.players?.find(p => p.id === playerId);
    const isMyTurn = gameState.currentPlayerIndex !== undefined && 
                     gameState.players?.[gameState.currentPlayerIndex]?.id === playerId;

    console.log("=== HAND DISPLAY DEBUG ===");
    console.log("playerId:", playerId);
    console.log("typeof playerId:", typeof playerId);
    console.log("currentPlayerIndex:", gameState.currentPlayerIndex);
    console.log("current player:", gameState.players?.[gameState.currentPlayerIndex]);
    console.log("isMyTurn:", isMyTurn);
    console.log("gameState.phase:", gameState.phase);
    console.log("waitingForTrumpSelection:", gameState.waitingForTrumpSelection);

    // Use cards in the exact order they come from server (already sorted)
    gameState.yourHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card hand-card';
        
        // Check if this card can be played
        const canPlay = isMyTurn && 
                       !gameState.waitingForTrumpSelection && 
                       KingMoveValidator.canPlayCard(gameState, card, playerId);
        
        console.log(`Card ${index} (${card.rank} of ${card.suit}): canPlay=${canPlay}, isMyTurn=${isMyTurn}, waitingForTrump=${gameState.waitingForTrumpSelection}`);
        
        // Add selected class if this card is selected
        if (selectedCard === index) {
            cardElement.classList.add('selected');
            console.log(`Card ${index} is SELECTED`);
        }
        
        // Disable unplayable cards (BelieveOrNot pattern)
        if (!canPlay) {
            cardElement.classList.add('disabled');
        }

        const suitSymbol = getSuitSymbol(card.suit);
        const suitClass = getSuitClass(card.suit);

        cardElement.innerHTML = `
            <div class="rank ${suitClass}">${card.rank}</div>
            <div class="suit ${suitClass}">${suitSymbol}</div>
        `;

        // Add click handler only for playable cards (BelieveOrNot pattern)
        if (canPlay) {
            cardElement.style.cursor = 'pointer';
            cardElement.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                console.log(`Card ${index} clicked - calling toggleCardSelection`);
                toggleCardSelection(index);
            });
        } else {
            cardElement.style.cursor = 'not-allowed';
            cardElement.title = getCardDisabledReason(gameState, card, isMyTurn);
        }

        handCards.appendChild(cardElement);
    });

    console.log("selectedCard:", selectedCard);
}

function getCardDisabledReason(gameState, card, isMyTurn) {
    if (!isMyTurn) {
        return "Wait for your turn";
    }

    if (gameState.waitingForTrumpSelection) {
        return "Choose trump suit first";
    }

    if (!gameState?.currentTrick) {
        return "Wait for trick to start";
    }

    const currentRound = gameState.currentRound;
    if (!currentRound) {
        return "No active round";
    }

    // Check if following suit and this card doesn't match lead suit
    if (gameState.currentTrick.cards && gameState.currentTrick.cards.length > 0) {
        const leadSuit = gameState.currentTrick.ledSuit;
        if (leadSuit && card.suit !== leadSuit) {
            const hasSameSuit = gameState.yourHand?.some(c => c.suit === leadSuit);
            if (hasSameSuit) {
                return `Must follow suit: ${leadSuit}`;
            }
        }
    }

    // Check Hearts leading restriction
    if (gameState.currentTrick.cards.length === 0 && currentRound.cannotLeadHearts && card.suit === 'Hearts') {
        const hasNonHearts = gameState.yourHand?.some(c => c.suit !== 'Hearts');
        if (hasNonHearts) {
            return "Cannot lead with Hearts when other suits available";
        }
    }

    return "Card cannot be played";
}