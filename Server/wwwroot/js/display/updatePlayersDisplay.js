function updatePlayersDisplay() {
    const playersArea = document.getElementById('playersArea');
    playersArea.innerHTML = '';

    if (!gameState.players) return;

    gameState.players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        if (index === gameState.currentPlayerIndex) {
            playerCard.classList.add('current-turn');
        }

        playerCard.innerHTML = `
            <h3>${player.name} ${!player.isConnected ? '(Disconnected)' : ''}</h3>
            <div class="player-stats">
                <div>Cards: ${player.handCount}</div>
                <div>Score: ${player.score}</div>
            </div>
        `;

        playersArea.appendChild(playerCard);
    });
}