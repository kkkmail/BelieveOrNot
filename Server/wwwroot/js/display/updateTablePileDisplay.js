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

    // FIXED: Create visual stack of full-size cards with LEFT offset (growth direction)
    cardPile.innerHTML = '';
    
    // Show exact number of cards with LEFT offset to simulate growth
    const cardWidth = 90; // Same as hand cards
    const cardHeight = 130;
    const offsetX = 3; // Horizontal offset per card
    
    // Calculate starting position so the pile grows to the left
    const startX = (pileCardCount - 1) * offsetX;
    
    for (let i = 0; i < pileCardCount; i++) {
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back pile-card';
        cardBack.style.position = 'absolute';
        cardBack.style.left = `${startX - (i * offsetX)}px`; // FIXED: Cards grow to the left
        cardBack.style.top = `${i * 1}px`; // Slight vertical offset
        cardBack.style.zIndex = i;
        cardBack.style.width = `${cardWidth}px`; // FIXED: Same size as hand cards
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
        
        // Show selection if this card is currently selected for challenge
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
        return;
    }
    
    if (!gameState.tablePileCount || gameState.tablePileCount === 0) {
        console.log("Cannot challenge: no cards on table");
        return;
    }
    
    // Check if it's the right time to challenge (not our turn, or 2-player special case)
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isMyTurn = currentPlayer && currentPlayer.id === playerId;
    
    // Special 2-player rule
    const playersWithNoCards = gameState.players.filter(p => p.handCount === 0);
    const is2PlayerWithZeroCards = gameState.players.length === 2 && playersWithNoCards.length > 0;
    
    const canChallenge = !isMyTurn || is2PlayerWithZeroCards;
    
    if (!canChallenge) {
        console.log("Cannot challenge: not the right time");
        showMessage("You can challenge when it's not your turn, or when opponent has 0 cards in 2-player game!", 3000, false);
        return;
    }
    
    // FIXED: Auto-submit challenge immediately like clicking table card should
    selectedChallengeIndex = cardIndex;
    
    // Get previous player info for confirmation
    const previousPlayerIndex = (gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length;
    const previousPlayer = gameState.players[previousPlayerIndex];
    
    const confirmed = confirm(
        `Challenge ${previousPlayer?.name || 'previous player'}?\n` +
        `You are challenging that card ${cardIndex + 1} is NOT a ${gameState.announcedRank}.`
    );
    
    if (confirmed) {
        // Submit challenge immediately
        submitChallenge();
    } else {
        // Clear selection if cancelled
        selectedChallengeIndex = -1;
        updatePreviousPlayDisplay();
    }
    
    console.log(`Direct challenge attempted for card ${cardIndex + 1}`);
}

// NEW: Function to update challenge area selection to match table selection
function updateChallengeCardsSelection() {
    const challengeCards = document.querySelectorAll('.challenge-card');
    challengeCards.forEach((card, i) => {
        card.classList.remove('selected');
        if (i === selectedChallengeIndex) {
            card.classList.add('selected');
        }
    });
}