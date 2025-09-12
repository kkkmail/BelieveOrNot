// js/display/updateHandDisplay.js
import {gameState, selectedCards} from "../core/variables.js";
import {toggleCardSelection} from "../cards/toggleCardSelection.js";
import {getSuitSymbol} from "../cards/getSuitSymbol.js";
import {getSuitClass} from "../cards/getSuitClass.js";

export function updateHandDisplay() {
    const handCards = document.getElementById('handCards');
    const handCount = document.getElementById('handCount');
    handCards.innerHTML = '';

    if (!gameState.yourHand) {
        handCount.textContent = '0';
        return;
    }

    // Sort cards: Jokers first, then by rank, then by suit
    const sortedHand = [...gameState.yourHand].sort((a, b) => {
        // Jokers come first
        if (a.rank === 'Joker' && b.rank !== 'Joker') return -1;
        if (a.rank !== 'Joker' && b.rank === 'Joker') return 1;
        if (a.rank === 'Joker' && b.rank === 'Joker') return 0;

        // Sort by rank using proper card order
        const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const aRankIndex = rankOrder.indexOf(a.rank);
        const bRankIndex = rankOrder.indexOf(b.rank);

        if (aRankIndex !== bRankIndex) {
            return aRankIndex - bRankIndex;
        }

        // Sort by suit
        const suitOrder = ['Spades', 'Clubs', 'Diamonds', 'Hearts'];
        return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    });

    handCount.textContent = sortedHand.length;

    sortedHand.forEach((card, sortedIndex) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${getSuitClass(card.suit)}`;

        if (card.rank === 'Joker') {
            cardElement.classList.add('joker');
            cardElement.innerHTML = `
                <div class="rank">🃏</div>
                <div class="suit">JOKER</div>
            `;
        } else {
            cardElement.innerHTML = `
                <div class="rank">${card.rank}</div>
                <div class="suit">${getSuitSymbol(card.suit)}</div>
            `;
        }

        // FIXED: Use proper event listener instead of onclick
        cardElement.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            toggleCardSelection(sortedIndex);
        });

        if (selectedCards.includes(sortedIndex)) {
            cardElement.classList.add('selected');
        }

        handCards.appendChild(cardElement);
    });
}
