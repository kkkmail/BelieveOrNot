function updateActionsDisplay() {
    const playBtn = document.getElementById('playBtn');
    const challengeBtn = document.getElementById('challengeBtn');
    const rankSelector = document.getElementById('rankSelector');

    // Hide all by default
    playBtn.classList.add('hidden');
    challengeBtn.classList.add('hidden');
    rankSelector.classList.add('hidden');

    if (!gameState || gameState.phase !== 1 || !playerId) return;

    // Check if it's our turn by comparing our playerId with current player
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isMyTurn = currentPlayer && currentPlayer.id === playerId;

    console.log("Turn check - Current player:", currentPlayer?.name, "My ID:", playerId, "Is my turn:", isMyTurn);

    if (isMyTurn) {
        // It's our turn - show play options
        if (!gameState.announcedRank) {
            // Opening turn (no announced rank yet)
            if (selectedCards.length > 0) {
                rankSelector.classList.remove('hidden');
                playBtn.classList.remove('hidden');
                playBtn.textContent = `Play ${selectedCards.length} Card(s)`;
            }
        } else {
            // Subsequent turns - can play or challenge
            if (selectedCards.length > 0) {
                playBtn.classList.remove('hidden');
                playBtn.textContent = `Play ${selectedCards.length} Card(s) as ${gameState.announcedRank}`;
            }
            if (gameState.tablePileCount > 0) {
                challengeBtn.classList.remove('hidden');
                challengeBtn.textContent = "Challenge Previous Player";
            }
        }
    } else {
        // Not our turn - can only challenge if there are cards on table
        if (gameState.tablePileCount > 0 && gameState.announcedRank) {
            challengeBtn.classList.remove('hidden');
            challengeBtn.textContent = `Challenge ${currentPlayer?.name || 'Previous Player'}`;
        }
    }
}