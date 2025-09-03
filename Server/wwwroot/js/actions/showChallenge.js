import {gameState} from "../core/variables.js";
import {selectedChallengeIndex} from "../core/variables.js";
import {hideChallenge} from "./hideChallenge.js";
import {updatePreviousPlayDisplay} from "../display/updatePreviousPlayDisplay.js";
import {selectChallengeCard} from "./selectChallengeCard.js";

export function showChallenge() {
    const challengeArea = document.getElementById('challengeArea');
    const challengeCards = document.getElementById('challengeCards');

    challengeArea.classList.remove('hidden');
    challengeCards.innerHTML = '';

    console.log("Challenge - Game State:", {
        tablePileCount: gameState.tablePileCount,
        lastPlayCardCount: gameState.lastPlayCardCount,
        LastPlayCardCount: gameState.LastPlayCardCount,
        currentPlayerIndex: gameState.currentPlayerIndex,
        announcedRank: gameState.announcedRank,
        selectedChallengeIndex: selectedChallengeIndex
    });

    // Determine how many cards to show for challenge
    let cardsToShow;

    const lastPlayCount = gameState.lastPlayCardCount || gameState.LastPlayCardCount;

    if (lastPlayCount && lastPlayCount > 0) {
        cardsToShow = Math.min(lastPlayCount, 3);
    } else if (gameState.tablePileCount > 0) {
        console.error("LastPlayCardCount not available! This is a server issue.");
        cardsToShow = Math.min(gameState.tablePileCount, 3);
    } else {
        console.error("No cards available to challenge");
        alert("No cards available to challenge");
        hideChallenge();
        return;
    }

    console.log("Showing " + cardsToShow + " cards for challenge (last play count: " + lastPlayCount + ")");

    const announcedRank = gameState.announcedRank || 'Unknown';

    // FIXED: Create challenge cards with proper classes and event handlers
    for (let i = 0; i < cardsToShow; i++) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card challenge-card-display'; // Use proper class
        cardElement.style.cursor = 'pointer';

        // Same content as table cards (? rank + announced rank)
        cardElement.innerHTML = '<div class="rank">?</div><div class="suit">' + announcedRank + '</div>';

        // Check if this card is already selected
        if (selectedChallengeIndex === i) {
            cardElement.classList.add('challenge-selected');
        }

        // Add click handler - FIXED to work properly
        cardElement.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Challenge card clicked:", i);
            selectChallengeCard(i);
        });

        challengeCards.appendChild(cardElement);
    }

    // Show instruction
    const instruction = challengeArea.querySelector('h3');
    if (instruction) {
        instruction.textContent = 'Choose a card to flip from the last play (' + cardsToShow + ' cards):';
    }

    // Update table display to show current selection
    updatePreviousPlayDisplay();
}