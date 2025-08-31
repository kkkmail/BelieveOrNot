function showChallenge() {
    const challengeArea = document.getElementById('challengeArea');
    const challengeCards = document.getElementById('challengeCards');

    challengeArea.classList.remove('hidden');
    challengeCards.innerHTML = '';

    // Show cards from last play for challenge
    const lastPlayCount = Math.min(3, gameState.tablePileCount); // Assume last play was max 3 cards

    for (let i = 0; i < lastPlayCount; i++) {
        const cardElement = document.createElement('div');
        cardElement.className = 'challenge-card';
        cardElement.textContent = '?';
        cardElement.onclick = () => selectChallengeCard(i);
        challengeCards.appendChild(cardElement);
    }
}