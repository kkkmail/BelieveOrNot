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
    
    if (pileCardCount <= 2) {
        // Not enough cards to show spreading
        cardPile.innerHTML = '<div style="color: #999; font-style: italic; margin-top: 40px;">Too few to spread</div>';
        return;
    }

    // FIXED: Use all available space dynamically
    cardPile.innerHTML = '';
    
    const cardWidth = 90;
    const cardHeight = 130;
    const containerWidth = 200; // Available space for pile (adjust based on your layout)
    
    // Calculate dynamic offset to use all space
    const cardsToSpread = pileCardCount - 2; // Reserve 2 cards worth of space
    const availableSpreadWidth = containerWidth - cardWidth;
    const dynamicOffset = cardsToSpread > 0 ? availableSpreadWidth / cardsToSpread : 0;
    
    // Limit offset to reasonable range
    const finalOffset = Math.min(Math.max(dynamicOffset, 2), 15);
    
    console.log(`Pile: ${pileCardCount} cards, spread: ${cardsToSpread}, offset: ${finalOffset}px`);
    
    for (let i = 0; i < pileCardCount; i++) {
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back pile-card';
        cardBack.style.position = 'absolute';
        cardBack.style.left = `${i * finalOffset}px`; // Dynamic spacing
        cardBack.style.top = '0px'; // No vertical offset
        cardBack.style.zIndex = i;
        cardBack.style.width = `${cardWidth}px`;
        cardBack.style.height = `${cardHeight}px`;
        
        cardPile.appendChild(cardBack);
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
        cardElement.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            handlePreviousCardClick(i);
        });
        
        // FIXED: Show selection if this card is currently selected for challenge
        // Check both direct table selection AND challenge area selection
        const challengeArea = document.getElementById('challengeArea');
        const isChallengeAreaVisible = challengeArea && !challengeArea.classList.contains('hidden');
        
        if (selectedChallengeIndex === i) {
            cardElement.classList.add('challenge-selected');
        }
        
        previousPlayCards.appendChild(cardElement);
    }
}

function handlePreviousCardClick(cardIndex) {
    console.log(`Previous play card ${cardIndex + 1} clicked - triggering challenge`);
    
    // Check if we can challenge
    if (!gameState || gameState.phase !== 1) {
        console.log("Cannot challenge: game not in progress");
        showMessage("Cannot challenge: game not in progress", 3000, false);
        return;
    }
    
    if (!gameState.tablePileCount || gameState.tablePileCount === 0) {
        console.log("Cannot challenge: no cards on table");
        showMessage("Cannot challenge: no cards on table", 3000, false);
        return;
    }
    
    if (!gameState.announcedRank) {
        console.log("Cannot challenge: no announced rank");
        showMessage("Cannot challenge: no announced rank", 3000, false);
        return;
    }
    
    // Challenge logic - can challenge when it's our turn OR 2-player special case
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isMyTurn = currentPlayer && currentPlayer.id === playerId;
    
    // Special 2-player rule
    const playersWithNoCards = gameState.players.filter(p => p.handCount === 0);
    const is2PlayerWithZeroCards = gameState.players.length === 2 && playersWithNoCards.length > 0;
    
    const canChallenge = isMyTurn || is2PlayerWithZeroCards;
    
    console.log("Challenge check:", {
        isMyTurn,
        is2PlayerWithZeroCards,
        canChallenge,
        currentPlayerName: currentPlayer?.name,
        myPlayerId: playerId
    });
    
    if (!canChallenge) {
        console.log("Cannot challenge: not the right conditions");
        showMessage("You can only challenge when it's your turn!", 3000, false);
        return;
    }
    
    // FIXED: Show challenge area first, then auto-select this card
    selectedChallengeIndex = cardIndex;
    showChallenge(); // This will sync the challenge area with our selection
    
    console.log(`Challenge area shown with card ${cardIndex + 1} pre-selected`);
}