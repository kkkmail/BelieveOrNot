// js/display/updateGameDisplay.js
import { gameState, playerId } from "../core/variables.js";
import { selectTrump } from "../actions/selectTrump.js";
import { playCard } from "../actions/playCard.js";

export function updateGameDisplay() {
    if (!gameState) return;

    console.log("Updating King game display...", gameState);

    updatePlayersDisplay();
    updateHandDisplay();
    updateCurrentTrick();
    updateTrumpSelection();
    updateActionButtons();
    updateRoundInfo();
    updateScoresDisplay();
    updateMatchIdDisplay();

    console.log("King game display updated");
}

function updatePlayersDisplay() {
    if (!gameState.players) return;

    gameState.players.forEach((player, index) => {
        const playerElem = document.getElementById(`playerPosition${index}`);
        if (!playerElem) return;

        const playerInfo = playerElem.querySelector('.player-info');
        if (!playerInfo) return;

        const nameElem = playerInfo.querySelector('.player-name');
        const cardCountElem = playerInfo.querySelector('.card-count');
        const scoreElem = playerInfo.querySelector('.score');

        if (nameElem) {
            nameElem.textContent = player.name;
        }

        if (cardCountElem) {
            cardCountElem.textContent = player.handCount || 0;
        }

        if (scoreElem) {
            scoreElem.textContent = player.score || 0;
        }

        // Update visual indicators
        playerElem.classList.toggle('current-turn', index === gameState.currentPlayerIndex);
        playerElem.classList.toggle('trump-setter', index === gameState.trumpSetterIndex && gameState.isCollectingPhase);
        playerElem.classList.remove('empty');
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

    if (gameState.phase === 1 && 
        gameState.isCollectingPhase && 
        gameState.trumpSetterIndex === getMyPlayerIndex() && 
        !gameState.currentTrump) {
        
        trumpSelection.classList.remove('hidden');
        
        // Setup trump selection buttons
        const trumpBtns = trumpSelection.querySelectorAll('.trump-btn');
        trumpBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const suit = btn.dataset.suit;
                selectTrump(suit);
            });
        });
    } else {
        trumpSelection.classList.add('hidden');
    }
}

function updateActionButtons() {
    const startRoundBtn = document.getElementById('startRoundBtn');
    const actionMessage = document.getElementById('actionMessage');
    
    if (startRoundBtn) {
        const isCreator = gameState.creatorPlayerId === playerId;
        const canStart = gameState.phase === 0 && gameState.players && gameState.players.length === 4;
        
        if (isCreator && canStart) {
            startRoundBtn.classList.remove('hidden');
        } else {
            startRoundBtn.classList.add('hidden');
        }
    }

    if (actionMessage) {
        if (gameState.phase === 0) {
            if (gameState.players && gameState.players.length < 4) {
                actionMessage.textContent = `Waiting for players (${gameState.players.length}/4)`;
            } else {
                actionMessage.textContent = 'Ready to start!';
            }
        } else if (gameState.phase === 1) {
            if (gameState.currentPlayerIndex === getMyPlayerIndex()) {
                if (gameState.isCollectingPhase && gameState.trumpSetterIndex === getMyPlayerIndex() && !gameState.currentTrump) {
                    actionMessage.textContent = 'Select trump suit';
                } else {
                    actionMessage.textContent = 'Your turn - play a card';
                }
            } else {
                const currentPlayer = gameState.players[gameState.currentPlayerIndex];
                actionMessage.textContent = `${currentPlayer?.name || 'Unknown'}'s turn`;
            }
        } else if (gameState.phase === 2) {
            actionMessage.textContent = 'Calculating scores...';
        } else if (gameState.phase === 3) {
            actionMessage.textContent = 'Game completed!';
        }
    }
}

function updateRoundInfo() {
    const currentRound = document.getElementById('currentRound');
    const currentPhase = document.getElementById('currentPhase');
    const currentPlayerName = document.getElementById('currentPlayerName');
    const currentTrump = document.getElementById('currentTrump');

    if (currentRound && gameState.currentRoundIndex !== undefined && gameState.totalRounds) {
        currentRound.textContent = `${gameState.currentRoundIndex + 1}/${gameState.totalRounds}`;
    }

    if (currentPhase) {
        if (gameState.phase === 0) {
            currentPhase.textContent = 'Setup';
        } else if (gameState.phase === 1) {
            currentPhase.textContent = gameState.isCollectingPhase ? 'Collecting' : 'Avoiding';
        } else if (gameState.phase === 2) {
            currentPhase.textContent = 'Round End';
        } else if (gameState.phase === 3) {
            currentPhase.textContent = 'Game End';
        }
    }

    if (currentPlayerName && gameState.players && gameState.currentPlayerIndex >= 0) {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        currentPlayerName.textContent = currentPlayer ? currentPlayer.name : '-';
    }

    if (currentTrump) {
        currentTrump.textContent = gameState.currentTrump ? getTrumpSymbol(gameState.currentTrump) : '-';
    }
}

function updateScoresDisplay() {
    const scoreTable = document.getElementById('scoreTable');
    if (!scoreTable || !gameState.players) return;

    scoreTable.innerHTML = '';

    gameState.players.forEach(player => {
        const scoreRow = document.createElement('div');
        scoreRow.className = 'score-row';
        scoreRow.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="player-score">${player.score || 0}</span>
        `;
        scoreTable.appendChild(scoreRow);
    });
}

function updateMatchIdDisplay() {
    const displayMatchId = document.getElementById('displayMatchId');
    if (displayMatchId && gameState.matchId) {
        displayMatchId.value = gameState.matchId;
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