function toggleCardSelection(cardIndex) {
    // Allow card selection during active game phase OR when it's not our turn (pre-selection)
    if (gameState && gameState.phase === 2) { // RoundEnd
        console.log("Card selection disabled: Round has ended");
        return; // Don't show message, just silently ignore
    }

    // Allow selection during game setup or when not our turn (for pre-selection)
    if (!gameState || (gameState.phase !== 1 && gameState.phase !== 0)) {
        console.log("Card selection disabled: Invalid game phase");
        return;
    }

    // Special rule: If there are only 2 players and one has 0 cards, disable card selection
    if (gameState && gameState.players && gameState.players.length === 2 && gameState.phase === 1) {
        const playersWithNoCards = gameState.players.filter(p => p.handCount === 0);
        if (playersWithNoCards.length > 0) {
            // One player has 0 cards - the other can only challenge, not play
            console.log("Card selection disabled: 2-player game with one player having 0 cards");
            return;
        }
    }

    const index = selectedCards.indexOf(cardIndex);
    if (index > -1) {
        selectedCards.splice(index, 1);
        console.log("Card deselected:", cardIndex);
    } else {
        if (selectedCards.length < 3) {
            selectedCards.push(cardIndex);
            console.log("Card selected:", cardIndex);
        } else {
            alert('You can only select up to 3 cards at a time');
            return;
        }
    }
    
    // FIXED: Clear "played" flag when selection changes
    window.cardsJustPlayed = false;
    
    // Update display immediately
    updateHandDisplay();
    updateActionsDisplay();
    updateCardPlayPreview(); // This will now show "Will play" again
    
    console.log('Selected cards:', selectedCards);
}