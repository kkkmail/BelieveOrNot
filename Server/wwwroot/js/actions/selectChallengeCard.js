function selectChallengeCard(index) {
    // Clear any previous selection
    selectedChallengeIndex = index;

    // Update visual selection
    const challengeCards = document.querySelectorAll('.challenge-card');
    challengeCards.forEach((card, i) => {
        card.classList.remove('selected');
        if (i === index) {
            card.classList.add('selected');
        }
    });
    
    console.log(`Selected challenge card at index: ${index}`);
}