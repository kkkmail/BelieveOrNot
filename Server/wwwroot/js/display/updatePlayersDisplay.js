function updatePlayersDisplay() {
    const playersArea = document.getElementById('playersArea');
    playersArea.innerHTML = '';

    if (!gameState.players) return;

    gameState.players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        
        // Add current turn highlighting with blinking effect
        if (index === gameState.currentPlayerIndex) {
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

        playerCard.innerHTML = `
            <h3>${playerNameDisplay}</h3>
            <div class="player-stats">
                <div>Cards: ${player.handCount}</div>
                <div>Score: ${player.score}</div>
                ${index === gameState.currentPlayerIndex ? '<div class="turn-indicator">🎯 Current Turn</div>' : ''}
            </div>
        `;

        playersArea.appendChild(playerCard);
    });
}