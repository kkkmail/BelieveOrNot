// Server/wwwroot/king/js/display/updatePlayersDisplay.js
import { gameState, playerId } from "../core/variables.js";

export function updatePlayersDisplay() {
    if (!gameState?.players) return;

    // Position mapping: creator always on left (position 0), then clockwise
    const positionMapping = [0, 1, 2, 3]; // top, right, bottom, left

    // Find current player's position and arrange others accordingly
    const myPlayerIndex = gameState.players.findIndex(p => p.id === playerId);

    for (let i = 0; i < 4; i++) {
        const playerPosition = document.getElementById(`playerPosition${i}`);
        if (!playerPosition) continue;

        if (i < gameState.players.length) {
            const player = gameState.players[i];
            const isMe = player.id === playerId;
            const isCreator = i === 0; // Creator is always first in the array
            const isCurrentTurn = gameState.phase === 1 && i === gameState.currentPlayerIndex;

            // Update player position classes
            playerPosition.className = `player-position ${getPositionClass(i)}`;

            if (isCurrentTurn) playerPosition.classList.add('current-turn');
            if (isCreator) playerPosition.classList.add('creator');
            if (isMe) playerPosition.classList.add('you');
            if (!player.isConnected) playerPosition.classList.add('disconnected');

            // Update player info
            const nameElement = playerPosition.querySelector('.player-name');
            const cardCountElement = playerPosition.querySelector('.card-count');
            const scoreElement = playerPosition.querySelector('.score');
            const cardsContainer = playerPosition.querySelector('.player-cards');

            if (nameElement) {
                let displayName = isMe ? 'You' : player.name;
                if (isCreator) {
                    displayName += ' ⭐';
                }
                nameElement.textContent = displayName;
            }

            if (cardCountElement) {
                cardCountElement.textContent = player.handCount;
            }

            if (scoreElement) {
                scoreElement.textContent = player.score;
                scoreElement.className = 'score';
                if (player.score > 0) scoreElement.classList.add('positive');
                else if (player.score < 0) scoreElement.classList.add('negative');
                else scoreElement.classList.add('zero');
            }

            // Update card backs display - show for all players including "You"
            if (cardsContainer) {
                cardsContainer.innerHTML = '';
                for (let j = 0; j < Math.min(player.handCount, 8); j++) {
                    const cardBack = document.createElement('div');
                    cardBack.className = 'player-card-back';
                    cardsContainer.appendChild(cardBack);
                }
            }
        } else {
            // Empty position
            playerPosition.className = `player-position ${getPositionClass(i)} empty`;

            const nameElement = playerPosition.querySelector('.player-name');
            const cardCountElement = playerPosition.querySelector('.card-count');
            const scoreElement = playerPosition.querySelector('.score');
            const cardsContainer = playerPosition.querySelector('.player-cards');

            if (nameElement) nameElement.textContent = 'Waiting...';
            if (cardCountElement) cardCountElement.textContent = '0';
            if (scoreElement) {
                scoreElement.textContent = '0';
                scoreElement.className = 'score zero';
            }
            if (cardsContainer) cardsContainer.innerHTML = '';
        }
    }
}

function getPositionClass(index) {
    const positions = ['top', 'right', 'bottom', 'left'];
    return positions[index] || 'top';
}
