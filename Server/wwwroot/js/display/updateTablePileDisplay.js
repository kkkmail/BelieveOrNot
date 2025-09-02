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
    
    pileCountDisplay.textContent = pileCardCount + ' cards';
    
    if (pileCardCount === 0) {
        cardPile.innerHTML = '<div style="color: #999; font-style: italic; margin-top: 40px;">Empty</div>';
        return;
    }

    // Clear pile
    cardPile.innerHTML = '';
    
    // FIXED: Wait for next frame to ensure container is rendered with correct width
    requestAnimationFrame(() => {
        // Get actual container width for spacing calculation
        const containerRect = cardPile.getBoundingClientRect();
        const containerWidth = Math.max(containerRect.width - 20, 200); // Account for padding
        const cardWidth = 90;
        
        console.log('Container width:', containerWidth, 'Card width:', cardWidth);
        
        // FIXED: Calculate total cards that could potentially be in the deck
        let totalCardsInDeck = 52; // Default deck size
        if (gameState.deckSize || gameState.DeckSize) {
            totalCardsInDeck = gameState.deckSize || gameState.DeckSize;
        }
        if (gameState.jokerCount || gameState.JokerCount) {
            totalCardsInDeck += (gameState.jokerCount || gameState.JokerCount);
        }
        
        // Max cards in pile = total deck - 2 (minimum needed elsewhere)
        const maxPossiblePileCards = Math.max(totalCardsInDeck - 2, pileCardCount);
        
        // FIXED: Calculate spacing to spread cards across available width
        let cardSpacing = 8; // Minimum reasonable spacing
        if (maxPossiblePileCards > 1 && containerWidth > cardWidth) {
            const totalWidthForSpacing = containerWidth - cardWidth; // Space available for spreading
            cardSpacing = Math.max(totalWidthForSpacing / (maxPossiblePileCards - 1), 6);
            cardSpacing = Math.min(cardSpacing, 25); // Maximum reasonable spacing
        }
        
        console.log('Pile: ' + pileCardCount + '/' + maxPossiblePileCards + ' cards, spacing: ' + cardSpacing.toFixed(1) + 'px');
        
        // Create cards with proper spacing and black borders
        for (let i = 0; i < pileCardCount; i++) {
            const cardBack = document.createElement('div');
            // Use exact same classes as hand cards for black borders
            cardBack.className = 'card';
            cardBack.style.position = 'absolute';
            cardBack.style.left = (i * cardSpacing) + 'px';
            cardBack.style.top = '5px'; // Small top margin
            cardBack.style.zIndex = i.toString();
            cardBack.style.width = cardWidth + 'px';
            cardBack.style.height = '130px';
            
            // Light card back with suit symbols - same style as defined in CSS
            cardBack.style.background = 'radial-gradient(circle at 30% 30%, rgba(116, 185, 255, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(187, 143, 206, 0.4) 0%, transparent 50%), linear-gradient(135deg, #9bb0c1 0%, #8299b5 50%, #9bb0c1 100%)';
            
            // Add suit symbols
            cardBack.innerHTML = '<div style="color: #34495e; opacity: 0.7; font-size: 20px; letter-spacing: 3px; text-shadow: 1px 1px 1px rgba(255,255,255,0.3);">♠♥♦♣</div>';
            
            cardPile.appendChild(cardBack);
        }
    });
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
    console.log('Previous play card ' + (cardIndex + 1) + ' clicked - showing challenge interface');
    
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
    
    // FIXED: This is equivalent to clicking Challenge button + selecting this card
    // 1. Set the selected challenge index
    selectedChallengeIndex = cardIndex;
    
    // 2. Show the challenge area (same as clicking Challenge button)
    showChallenge(); // This will create identical cards and show the selected one
    
    console.log('Challenge interface shown with card ' + (cardIndex + 1) + ' pre-selected');
}