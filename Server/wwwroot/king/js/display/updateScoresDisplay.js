// Server/wwwroot/king/js/display/updateScoresDisplay.js
import { gameState, playerId } from "../core/variables.js";

export function updateScoresDisplay() {
    const scoreTable = document.getElementById('scoreTable');
    if (!scoreTable) return;
    
    scoreTable.innerHTML = '';

    if (!gameState?.players) return;

    gameState.players.forEach((player, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        
        const isCreator = index === 0; // Creator is always first
        const isMe = player.id === playerId;
        
        if (isCreator) scoreItem.classList.add('creator');
        if (isMe) scoreItem.classList.add('you');

        let playerNameDisplay = player.name;
        const markers = [];
        
        if (isCreator) markers.push('⭐ Creator');
        if (isMe) markers.push('👤 You');
        if (!player.isConnected) markers.push('⚠️ Offline');

        if (markers.length > 0) {
            playerNameDisplay += ` (${markers.join(', ')})`;
        }

        scoreItem.innerHTML = `
            <div class="player-name">${playerNameDisplay}</div>
            <div class="score ${player.score > 0 ? 'positive' : player.score < 0 ? 'negative' : 'zero'}">${player.score}</div>
            <div class="hand-count">${player.handCount} cards</div>
        `;
        
        scoreTable.appendChild(scoreItem);
    });
}