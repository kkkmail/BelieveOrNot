function hideChallenge() {
    document.getElementById('challengeArea').classList.add('hidden');
    selectedChallengeIndex = -1;
    
    // FIXED: Also clear table selection when challenge is cancelled
    updatePreviousPlayDisplay();
}