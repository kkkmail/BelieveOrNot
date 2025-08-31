function showChallenge() {
    const challengeArea = document.getElementById('challengeArea');
    const challengeCards = document.getElementById('challengeCards');

    challengeArea.classList.remove('hidden');
    challengeCards.innerHTML = '';

    // Debug: Log the game state to understand what data we have
    console.log("Challenge - Game State:", {
        tablePileCount: gameState.tablePileCount,
        lastPlayCount: gameState.lastPlayCount,
        currentPlayerIndex: gameState.currentPlayerIndex,
        announcedRank: gameState.announcedRank
    });

    // Determine how many cards to show for challenge
    let cardsToShow;
    
    if (gameState.lastPlayCount && gameState.lastPlayCount > 0) {
        // Use lastPlayCount if available from server
        cardsToShow = Math.min(gameState.lastPlayCount, 3);
    } else if (gameState.tablePileCount > 0) {
        // Fallback: if we don't have lastPlayCount, assume they played 1-3 cards
        // This is not ideal but better than showing 0 cards
        cardsToShow = Math.min(gameState.tablePileCount, 3);
        console.warn("lastPlayCount not available, using tablePileCount as fallback");
    } else {
        console.error("No cards available to challenge");
        alert("No cards available to challenge");
        hideChallenge();
        return;
    }

    console.log(`Showing ${cardsToShow} cards for challenge (last play count: ${gameState.lastPlayCount})`);

    // Create challenge cards
    for (let i = 0; i < cardsToShow; i++) {
        const cardElement = document.createElement('div');
        cardElement.className = 'challenge-card';
        cardElement.textContent = `Card ${i + 1}`;
        cardElement.onclick = () => selectChallengeCard(i);
        challengeCards.appendChild(cardElement);
    }

    // Show instruction
    const instruction = challengeArea.querySelector('h3');
    if (instruction) {
        instruction.textContent = `Choose a card to flip from the last play (${cardsToShow} cards):`;
    }
}