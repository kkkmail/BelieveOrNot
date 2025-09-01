function updatePlayersDisplay() {
    const playersArea = document.getElementById('playersArea');
    playersArea.innerHTML = '';

    if (!gameState.players) return;

    // FIXED: Only show current turn during active gameplay (Phase 1: InProgress)
    const isActiveRound = gameState.phase === 1;

    gameState.players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        
        // FIXED: Add current turn highlighting with blinking effect ONLY during active rounds
        if (isActiveRound && index === gameState.currentPlayerIndex) {
            playerCard.classList.add('current-turn');
        }

        // Check if this is the current user's card
        const isMe = player.id === playerId;
        
        let playerNameDisplay = player.name;
        
        // Add markers
        const markers = [];
        if (gameState.creatorPlayerId === player.id) {
            markers.push('⭐ Creator'); // Game starter mark
        }
        if (isMe) {
            markers.push('👤 You'); // Current player mark
        }
        if (!player.isConnected) {
            markers.push('(Disconnected)');
        }
        
        if (markers.length > 0) {
            playerNameDisplay += ` ${markers.join(' ')}`;
        }

        // FIXED: Only show turn indicator during active rounds
        const turnIndicator = (isActiveRound && index === gameState.currentPlayerIndex) 
            ? '<div class="turn-indicator">🎯 Current Turn</div>' 
            : '';

        playerCard.innerHTML = `
            <h3>${playerNameDisplay}</h3>
            <div class="player-stats">
                <div>Cards: ${player.handCount}</div>
                <div>Score: ${player.score}</div>
                ${turnIndicator}
            </div>
        `;

        playersArea.appendChild(playerCard);
    });
}