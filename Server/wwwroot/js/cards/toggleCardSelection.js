function toggleCardSelection(cardIndex) {
    // CRITICAL FIX: Prevent card selection when round has ended
    if (gameState && gameState.phase === 2) { // RoundEnd
        console.log("Card selection disabled: Round has ended");
        showMessage("Round has ended. Wait for the game creator to start a new round.", 3000);
        return;
    }

    // CRITICAL FIX: Prevent card selection during game setup or other non-active phases
    if (!gameState || gameState.phase !== 1) {
        console.log("Card selection disabled: Game not in progress");
        return;
    }

    // Special rule: If there are only 2 players and one has 0 cards, disable card selection
    if (gameState && gameState.players && gameState.players.length === 2) {
        const playersWithNoCards = gameState.players.filter(p => p.handCount === 0);
        if (playersWithNoCards.length > 0) {
            // One player has 0 cards - the other can only challenge, not play
            console.log("Card selection disabled: 2-player game with one player having 0 cards");
            showMessage("You can only challenge when your opponent has no cards left!", 3000);
            return;
        }
    }

    const index = selectedCards.indexOf(cardIndex);
    if (index > -1) {
        selectedCards.splice(index, 1);
    } else {
        if (selectedCards.length < 3) {
            selectedCards.push(cardIndex);
        } else {
            alert('You can only select up to 3 cards at a time');
            return;
        }
    }
    
    // Update display immediately
    updateHandDisplay();
    updateActionsDisplay();
    
    console.log('Selected cards:', selectedCards);
}