function selectChallengeCard(index) {
    selectedChallengeIndex = index;

    // Update visual selection
    const challengeCards = document.querySelectorAll('.challenge-card');
    challengeCards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}