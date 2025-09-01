function showChallenge() {
    const challengeArea = document.getElementById('challengeArea');
    const challengeCards = document.getElementById('challengeCards');

    challengeArea.classList.remove('hidden');
    challengeCards.innerHTML = '';

    // Debug: Log the game state to understand what data we have
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
    
    // Fixed: Use the correct property name from C# (LastPlayCardCount)
    const lastPlayCount = gameState.lastPlayCardCount || gameState.LastPlayCardCount;
    
    if (lastPlayCount && lastPlayCount > 0) {
        // Use LastPlayCardCount if available from server
        cardsToShow = Math.min(lastPlayCount, 3);
    } else if (gameState.tablePileCount > 0) {
        // Fallback: This should not happen, but if LastPlayCardCount is missing
        console.error("LastPlayCardCount not available! This is a server issue.");
        cardsToShow = Math.min(gameState.tablePileCount, 3);
    } else {
        console.error("No cards available to challenge");
        alert("No cards available to challenge");
        hideChallenge();
        return;
    }

    console.log(`Showing ${cardsToShow} cards for challenge (last play count: ${lastPlayCount})`);

    // Create challenge cards with proper event handling
    for (let i = 0; i < cardsToShow; i++) {
        const cardElement = document.createElement('div');
        cardElement.className = 'challenge-card';
        cardElement.textContent = `Card ${i + 1}`;
        
        // FIXED: Check if this card is already selected (from table click)
        if (selectedChallengeIndex === i) {
            cardElement.classList.add('selected');
        }
        
        // Use proper event listener instead of onclick to prevent violations
        cardElement.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            selectChallengeCard(i);
        });
        
        challengeCards.appendChild(cardElement);
    }

    // Show instruction
    const instruction = challengeArea.querySelector('h3');
    if (instruction) {
        instruction.textContent = `Choose a card to flip from the last play (${cardsToShow} cards):`;
    }
    
    // FIXED: Update table display to show current selection
    updatePreviousPlayDisplay();
}