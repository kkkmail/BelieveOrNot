function selectChallengeCard(index) {
    // Set the selected challenge index
    selectedChallengeIndex = index;

    // Update visual selection in challenge area
    const challengeCards = document.querySelectorAll('.challenge-card');
    challengeCards.forEach((card, i) => {
        card.classList.remove('selected');
        if (i === index) {
            card.classList.add('selected');
        }
    });
    
    // FIXED: Also update the table display to show the selection
    updatePreviousPlayDisplay();
    
    console.log(`Selected challenge card at index: ${index} (synced with table display)`);
}