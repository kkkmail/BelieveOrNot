import {handlePreviousCardClick} from "./handlePreviousCardClick.js";
import {gameState, selectedChallengeIndex} from "../core/variables.js";

export function updatePreviousPlayDisplay() {
    const previousPlayCards = document.getElementById('previousPlayCards');
    const playInfoDisplay = document.getElementById('playInfoDisplay');
    const previousPlaySection = document.getElementById('previousPlaySection');

    // CRITICAL: Don't clear cards if challenge animation is pending/running for challenger
    if (window.pendingChallengeAnimation && selectedChallengeIndex !== -1) {
        console.log("🚫 Preserving previous play cards during challenger animation");
        return;
    }

    // CRITICAL: Don't clear cards if challenge animation is about to happen for non-challenger
    if (window.challengeEventPending) {
        console.log("🚫 Preserving previous play cards - challenge event pending");
        return;
    }

    const lastPlayCount = gameState.lastPlayCardCount || gameState.LastPlayCardCount || 0;

    if (!lastPlayCount || lastPlayCount === 0) {
        previousPlayCards.innerHTML = '<div style="color: #999; font-style: italic;">No previous play</div>';
        playInfoDisplay.textContent = 'No previous play';
        previousPlaySection.style.opacity = '0.6';
        return;
    }

    previousPlaySection.style.opacity = '1';
    previousPlayCards.innerHTML = '';

    // Get the previous player info
    const currentPlayerIndex = gameState.currentPlayerIndex;
    const previousPlayerIndex = (currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length;
    const previousPlayer = gameState.players[previousPlayerIndex];
    const announcedRank = gameState.announcedRank || 'Unknown';

    playInfoDisplay.innerHTML = `${previousPlayer?.name || 'Previous Player'}<br>${lastPlayCount} card(s) as ${announcedRank}`;

    // Create clickable face-up cards for the previous play (same size as hand cards)
    for (let i = 0; i < lastPlayCount; i++) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card previous-play-card';
        cardElement.style.cursor = 'pointer';

        // Show question marks since we don't know the actual cards
        cardElement.innerHTML = `
            <div class="rank">?</div>
            <div class="suit">${announcedRank}</div>
        `;

        // Add click handler for challenge
        cardElement.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            handlePreviousCardClick(i);
        });

        // Show selection if this card is currently selected for challenge
        if (selectedChallengeIndex === i) {
            cardElement.classList.add('challenge-selected');
        }

        previousPlayCards.appendChild(cardElement);
    }
}