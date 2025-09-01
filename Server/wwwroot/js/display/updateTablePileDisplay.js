function updateTablePileDisplay() {
    updateCardPileDisplay();
    updatePreviousPlayDisplay();
}

function updateCardPileDisplay() {
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
    
    pileCountDisplay.textContent = `${pileCardCount} cards`;
    
    if (pileCardCount === 0) {
        cardPile.innerHTML = '<div style="color: #999; font-style: italic; margin-top: 40px;">Empty</div>';
        return;
    }

    // Create visual stack of face-down cards
    cardPile.innerHTML = '';
    
    // Show up to 5 card backs stacked with slight offset
    const cardsToShow = Math.min(pileCardCount, 5);
    
    for (let i = 0; i < cardsToShow; i++) {
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.style.position = 'absolute';
        cardBack.style.left = `${i * 2}px`;
        cardBack.style.top = `${i * 2}px`;
        cardBack.style.zIndex = i;
        
        cardPile.appendChild(cardBack);
    }
    
    // If there are more than 5 cards, show a count indicator
    if (pileCardCount > 5) {
        const countIndicator = document.createElement('div');
        countIndicator.className = 'pile-count-indicator';
        countIndicator.textContent = `+${pileCardCount - 5}`;
        countIndicator.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #dc3545;
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: bold;
            z-index: 10;
        `;
        cardPile.appendChild(countIndicator);
    }
}

function updatePreviousPlayDisplay() {
    const previousPlayCards = document.getElementById('previousPlayCards');
    const playInfoDisplay = document.getElementById('playInfoDisplay');
    const previousPlaySection = document.getElementById('previousPlaySection');
    
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
    
    // Create clickable face-up cards for the previous play
    for (let i = 0; i < lastPlayCount; i++) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card table-card previous-play-card';
        cardElement.style.cursor = 'pointer';
        
        // Show question marks since we don't know the actual cards
        cardElement.innerHTML = `
            <div class="rank">?</div>
            <div class="suit">${announcedRank}</div>
        `;
        
        // Add click handler for challenge
        cardElement.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            handlePreviousCardClick(i);
        });
        
        previousPlayCards.appendChild(cardElement);
    }
}

function handlePreviousCardClick(cardIndex) {
    console.log(`Previous play card ${cardIndex + 1} clicked - triggering challenge`);
    
    // Check if we can challenge
    if (!gameState || gameState.phase !== 1) {
        console.log("Cannot challenge: game not in progress");
        return;
    }
    
    if (!gameState.tablePileCount || gameState.tablePileCount === 0) {
        console.log("Cannot challenge: no cards on table");
        return;
    }
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const canChallenge = currentPlayer && currentPlayer.id !== playerId; // Not our turn
    
    if (!canChallenge) {
        console.log("Cannot challenge: not the right time");
        showMessage("You can only challenge when it's not your turn!", 3000, false);
        return;
    }
    
    // Auto-select this card and show challenge interface
    selectedChallengeIndex = cardIndex;
    
    // Highlight the selected card
    const previousCards = document.querySelectorAll('.previous-play-card');
    previousCards.forEach((card, i) => {
        card.classList.remove('challenge-selected');
        if (i === cardIndex) {
            card.classList.add('challenge-selected');
        }
    });
    
    // Show confirmation dialog
    const previousPlayer = gameState.players[(gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length];
    const confirmed = confirm(
        `Challenge ${previousPlayer?.name || 'previous player'}?\n` +
        `You are challenging that card ${cardIndex + 1} is NOT a ${gameState.announcedRank}.`
    );
    
    if (confirmed) {
        submitChallenge();
    } else {
        // Clear selection if cancelled
        selectedChallengeIndex = -1;
        previousCards.forEach(card => card.classList.remove('challenge-selected'));
    }
}