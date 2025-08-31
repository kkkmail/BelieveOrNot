function toggleCardSelection(cardIndex) {
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