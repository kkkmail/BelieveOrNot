function updateRoundInfo() {
    const currentRound = document.getElementById('currentRound');
    const currentPhase = document.getElementById('currentPhase');
    const currentPlayerName = document.getElementById('currentPlayerName');
    const currentTrump = document.getElementById('currentTrump');

    if (currentRound && gameState.currentRoundIndex !== undefined && gameState.totalRounds) {
        currentRound.textContent = `${gameState.currentRoundIndex + 1}/${gameState.totalRounds}`;
    }

    if (currentPhase) {
        if (gameState.phase === 0) {
            currentPhase.textContent = 'Setup';
        } else if (gameState.phase === 1) {
            currentPhase.textContent = gameState.isCollectingPhase ? 'Collecting' : 'Avoiding';
        } else if (gameState.phase === 2) {
            currentPhase.textContent = 'Round End';
        } else if (gameState.phase === 3) {
            currentPhase.textContent = 'Game End';
        }
    }

    if (currentPlayerName && gameState.players && gameState.currentPlayerIndex >= 0) {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        currentPlayerName.textContent = currentPlayer ? currentPlayer.name : '-';
    }

    if (currentTrump) {
        currentTrump.textContent = gameState.currentTrump ? getTrumpSymbol(gameState.currentTrump) : '-';
    }
}