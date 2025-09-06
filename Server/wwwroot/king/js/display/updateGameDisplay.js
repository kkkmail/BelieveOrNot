// js/display/updateGameDisplay.js
import { gameState, playerId } from "../core/variables.js";

export function updateGameDisplay() {
    if (!gameState) {
        console.log('No game state to display');
        return;
    }

    console.log('Updating game display with state:', gameState);

    // Update basic game info
    const currentRoundElem = document.getElementById('currentRound');
    if (currentRoundElem) {
        currentRoundElem.textContent = `${gameState.currentRoundIndex + 1}/${gameState.totalRounds}`;
    }

    const currentPhaseElem = document.getElementById('currentPhase');
    if (currentPhaseElem) {
        currentPhaseElem.textContent = gameState.isCollectingPhase ? 'Collecting' : 'Avoiding';
    }

    const currentPlayerElem = document.getElementById('currentPlayerName');
    if (currentPlayerElem && gameState.players && gameState.players.length > gameState.currentPlayerIndex) {
        currentPlayerElem.textContent = gameState.players[gameState.currentPlayerIndex].name;
    }

    const currentTrumpElem = document.getElementById('currentTrump');
    if (currentTrumpElem) {
        currentTrumpElem.textContent = gameState.currentTrump ? `${getTrumpSymbol(gameState.currentTrump)} ${gameState.currentTrump}` : '-';
    }

    // Update match ID display
    const displayMatchId = document.getElementById('displayMatchId');
    if (displayMatchId) {
        displayMatchId.value = gameState.matchId.replace(/-/g, '');
    }

    // Update phase text
    const phaseText = {
        0: 'Waiting for Players',
        1: 'Game In Progress',
        2: 'Round Ended',
        3: 'Game Ended'
    };
    const gamePhaseElem = document.getElementById('gamePhase');
    if (gamePhaseElem) {
        gamePhaseElem.textContent = phaseText[gameState.phase] || 'Unknown';
    }

    // Update players around the table
    updatePlayersDisplay();

    // Update hand
    updateHandDisplay();

    // Update current trick
    updateCurrentTrick();

    // Update trump selection
    updateTrumpSelection();

    // Update action buttons
    updateActionButtons();
}

function updatePlayersDisplay() {
    if (!gameState.players) return;

    gameState.players.forEach((player, index) => {
        const playerElem = document.getElementById(`playerPosition${player.position}`);
        if (playerElem) {
            const nameElem = playerElem.querySelector('.player-name');
            const cardCountElem = playerElem.querySelector('.card-count');
            const scoreElem = playerElem.querySelector('.score');

            if (nameElem) {
                let displayName = player.name;
                if (player.id === playerId) {
                    displayName += ' (You)';
                }
                if (!player.isConnected) {
                    displayName += ' (Disconnected)';
                }
                nameElem.textContent = displayName;
            }

            if (cardCountElem) {
                cardCountElem.textContent = player.handCount;
            }

            if (scoreElem) {
                scoreElem.textContent = player.score;
            }

            // Update visual indicators
            playerElem.classList.toggle('current-turn', index === gameState.currentPlayerIndex);
            playerElem.classList.toggle('trump-setter', index === gameState.trumpSetterIndex && gameState.isCollectingPhase);
            playerElem.classList.remove('empty');
        }
    });
}

function updateHandDisplay() {
    const handCards = document.getElementById('handCards');
    const handCount = document.getElementById('handCount');
    
    if (!handCards || !handCount) return;

    if (!gameState.yourHand) {
        handCount.textContent = '0';
        handCards.innerHTML = '';
        return;
    }

    handCount.textContent = gameState.yourHand.length;
    handCards.innerHTML = '';

    gameState.yourHand.forEach((card, index) => {
        const cardElem = document.createElement('div');
        cardElem.className = `card ${card.suit.toLowerCase()}`;
        
        if (card.rank === 'King' && card.suit === 'Hearts') {
            cardElem.classList.add('king-of-hearts');
        }

        cardElem.innerHTML = `
            <div class="rank">${card.rank}</div>
            <div class="suit">${getSuitSymbol(card.suit)}</div>
        `;

        cardElem.addEventListener('click', () => {
            if (gameState.phase === 1 && gameState.currentPlayerIndex === getMyPlayerIndex()) {
                playCard(card);
            }
        });

        handCards.appendChild(cardElem);
    });
}

function updateCurrentTrick() {
    const currentTrick = document.getElementById('currentTrick');
    if (!currentTrick) return;

    currentTrick.innerHTML = '';

    if (gameState.currentTrick && gameState.currentTrick.length > 0) {
        gameState.currentTrick.forEach((card, index) => {
            const cardElem = document.createElement('div');
            cardElem.className = `trick-card ${card.suit.toLowerCase()}`;
            cardElem.innerHTML = `
                <div class="rank">${card.rank}</div>
                <div class="suit">${getSuitSymbol(card.suit)}</div>
            `;
            currentTrick.appendChild(cardElem);
        });
    }
}

function updateTrumpSelection() {
    const trumpSelection = document.getElementById('trumpSelection');
    if (!trumpSelection) return;

    if (gameState.canSelectTrump) {
        trumpSelection.classList.remove('hidden');
        
        // Setup trump selection buttons
        const trumpButtons = trumpSelection.querySelectorAll('.trump-btn');
        trumpButtons.forEach(btn => {
            const suit = btn.getAttribute('data-suit');
            btn.onclick = () => selectTrump(suit);
        });
    } else {
        trumpSelection.classList.add('hidden');
    }
}

function updateActionButtons() {
    const startRoundBtn = document.getElementById('startRoundBtn');
    const actionMessage = document.getElementById('actionMessage');
    
    if (!actionMessage) return;

    // Show start button only for creator when waiting for players with 4 players
    if (startRoundBtn) {
        const isCreator = gameState.creatorPlayerId === playerId;
        const hasEnoughPlayers = gameState.players && gameState.players.length === 4;
        const canStart = gameState.phase === 0 && isCreator && hasEnoughPlayers;
        
        if (canStart) {
            startRoundBtn.classList.remove('hidden');
        } else {
            startRoundBtn.classList.add('hidden');
        }
    }

    // Update action message
    if (gameState.phase === 0) {
        if (gameState.players && gameState.players.length < 4) {
            actionMessage.textContent = `Waiting for players (${gameState.players.length}/4)`;
        } else {
            actionMessage.textContent = 'Ready to start! Creator can begin the round.';
        }
    } else if (gameState.phase === 1) {
        const currentPlayerIndex = gameState.currentPlayerIndex;
        const isMyTurn = currentPlayerIndex === getMyPlayerIndex();
        
        if (gameState.canSelectTrump) {
            actionMessage.innerHTML = '👑 <strong>Select trump suit for this round</strong>';
        } else if (gameState.waitingForTrumpSelection) {
            const trumpSetter = gameState.players[gameState.trumpSetterIndex];
            actionMessage.innerHTML = `⏳ Waiting for <strong>${trumpSetter.name}</strong> to select trump`;
        } else if (isMyTurn) {
            actionMessage.innerHTML = `🎯 <strong>Your turn!</strong> ${gameState.currentRoundDescription}`;
        } else {
            const currentPlayer = gameState.players[currentPlayerIndex];
            actionMessage.innerHTML = `⏳ Waiting for <strong>${currentPlayer.name}</strong> to play`;
        }
    } else if (gameState.phase === 2) {
        actionMessage.textContent = 'Round ended. Calculating scores...';
    } else if (gameState.phase === 3) {
        actionMessage.textContent = 'Game completed!';
    }
}

function getMyPlayerIndex() {
    if (!gameState.players || !playerId) return -1;
    return gameState.players.findIndex(p => p.id === playerId);
}

function getSuitSymbol(suit) {
    switch(suit) {
        case 'Hearts': return '♥️';
        case 'Diamonds': return '♦️';
        case 'Clubs': return '♣️';
        case 'Spades': return '♠️';
        default: return suit;
    }
}

function getTrumpSymbol(suit) {
    return getSuitSymbol(suit);
}

// Placeholder functions - these would be implemented in separate files
function playCard(card) {
    console.log('Play card:', card);
    // TODO: Implement card playing
}

function selectTrump(suit) {
    console.log('Select trump:', suit);
    // TODO: Implement trump selection
}