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

    // Special 2-player rule: If there are 2 players and one has 0 cards, 
    // the other can ONLY challenge (no playing)
    const playersWithNoCards = gameState.players.filter(p => p.handCount === 0);
    const is2PlayerWithZeroCards = gameState.players.length === 2 && playersWithNoCards.length > 0;

    console.log("Turn check - Current player:", currentPlayer?.name, "My ID:", playerId, "Is my turn:", isMyTurn);
    console.log("2-player with zero cards:", is2PlayerWithZeroCards);
    console.log("Game state - tablePileCount:", gameState.tablePileCount, "announcedRank:", gameState.announcedRank);

    // ONLY show buttons if it's my turn
    if (isMyTurn) {
        if (!gameState.announcedRank) {
            // Opening turn (no announced rank yet) - can play
            if (selectedCards.length > 0 && !is2PlayerWithZeroCards) {
                rankSelector.classList.remove('hidden');
                playBtn.classList.remove('hidden');
                playBtn.textContent = `Play ${selectedCards.length} Card(s)`;
            }
        } else {
            // Subsequent turns
            if (is2PlayerWithZeroCards) {
                // Special case: 2-player game with one having 0 cards - can only challenge
                if (gameState.tablePileCount > 0 && gameState.announcedRank) {
                    challengeBtn.classList.remove('hidden');
                    const opponentWithZeroCards = playersWithNoCards[0];
                    challengeBtn.textContent = `Challenge ${opponentWithZeroCards.name}`;
                }
            } else {
                // Normal turn - can play or challenge
                if (selectedCards.length > 0) {
                    playBtn.classList.remove('hidden');
                    playBtn.textContent = `Play ${selectedCards.length} Card(s) as ${gameState.announcedRank}`;
                }
                
                // Can challenge previous player if there are cards on table
                if (gameState.tablePileCount > 0 && gameState.announcedRank) {
                    const previousPlayerIndex = (gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length;
                    const previousPlayer = gameState.players[previousPlayerIndex];
                    
                    challengeBtn.classList.remove('hidden');
                    challengeBtn.textContent = `Challenge ${previousPlayer.name}`;
                }
            }
        }
    }
    // REMOVED: No buttons visible when it's not your turn
}