function updateScoresDisplay() {
    const scoreTable = document.getElementById('scoreTable');
    scoreTable.innerHTML = '';

    if (!gameState.players) return;

    gameState.players.forEach(player => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        scoreItem.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="score">${player.score}</div>
        `;
        scoreTable.appendChild(scoreItem);
    });
}