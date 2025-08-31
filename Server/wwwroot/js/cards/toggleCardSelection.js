function toggleCardSelection(cardIndex) {
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
    
    // Update display immediately and clear any phantom selections
    updateHandDisplay();
    updateActionsDisplay();
    
    // Force refresh of card selection state
    console.log('Selected cards:', selectedCards);
}