function updateRankDropdown() {
    const declaredRankSelect = document.getElementById('declaredRank');
    
    if (!declaredRankSelect) return;

    // Clear existing options
    declaredRankSelect.innerHTML = '';

    // Add default empty option (forces user to choose)
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Choose rank...';
    defaultOption.selected = true;
    declaredRankSelect.appendChild(defaultOption);

    // Determine available ranks based on deck size (with fallback)
    let availableRanks = [];
    const deckSize = gameState?.deckSize || gameState?.DeckSize || 52; // Fallback to 52
    
    if (deckSize === 32) {
        availableRanks = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    } else if (deckSize === 36) {
        availableRanks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    } else { // 52 cards (default)
        availableRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    }

    // Add rank options
    availableRanks.forEach(rank => {
        const option = document.createElement('option');
        option.value = rank;
        option.textContent = rank;
        declaredRankSelect.appendChild(option);
    });

    // REMOVED: No longer adding Joker as a selectable rank
    // Players cannot declare "Joker" as the announced rank
}