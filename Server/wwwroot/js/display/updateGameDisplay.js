function updateGameDisplay() {
    if (!gameState) return;

    // Update basic game info
    document.getElementById('roundNumber').textContent = gameState.roundNumber;
    document.getElementById('announcedRank').textContent = gameState.announcedRank || '-';
    document.getElementById('tablePileCount').textContent = gameState.tablePileCount;
    document.getElementById('displayMatchId').value = gameState.matchId;

    // Update table pile display
    updateTablePileDisplay();

    // Update current player
    if (gameState.players && gameState.players.length > gameState.currentPlayerIndex) {
        document.getElementById('currentPlayerName').textContent =
            gameState.players[gameState.currentPlayerIndex].name;
    }

    // Update phase
    const phaseText = {
        0: 'Waiting for Players',
        1: 'Game In Progress',
        2: 'Round Ended',
        3: 'Game Ended'
    };
    document.getElementById('gamePhase').textContent = phaseText[gameState.phase] || 'Unknown';

    // Update rank dropdown based on game settings
    updateRankDropdown();

    // Update players display
    updatePlayersDisplay();

    // Update hand
    updateHandDisplay();

    // Update actions
    updateActionsDisplay();

    // Update scores
    updateScoresDisplay();

    // Show start button only for creator and when there are enough players
    const startBtn = document.getElementById('startRoundBtn');
    if (gameState.phase === 0 &&
        gameState.players.length >= 2 &&
        playerId &&
        gameState.creatorPlayerId === playerId) {
        startBtn.classList.remove('hidden');
    } else {
        startBtn.classList.add('hidden');
    }

    // Clear any lingering card selections after state update
    selectedCards = [];
}