// js/display/updateActionsDisplay.js
import {gameState, playerId, selectedCards, selectedChallengeIndex, setSelectedCards} from "../core/variables.js";
import {getSuitSymbol} from "../cards/getSuitSymbol.js";
import {CONFIG} from "../utils/config.js";

export function updateActionsDisplay() {
    const playBtn = document.getElementById('playBtn');
    const confirmChallengeBtn = document.getElementById('confirmChallengeBtn');
    const rankSelector = document.getElementById('rankSelector');
    const startRoundBtn = document.getElementById('startRoundBtn');
    const endRoundBtn = document.getElementById('endRoundBtn');
    const endGameBtn = document.getElementById('endGameBtn');
    const tableMessage = document.getElementById('tableMessage');
    const tableControls = document.getElementById('tableControls');

    // Hide all by default
    if (playBtn) playBtn.classList.add('hidden');
    if (confirmChallengeBtn) confirmChallengeBtn.classList.add('hidden');
    if (rankSelector) rankSelector.classList.add('hidden');
    if (startRoundBtn) startRoundBtn.classList.add('hidden');
    if (endRoundBtn) endRoundBtn.classList.add('hidden');
    if (endGameBtn) endGameBtn.classList.add('hidden');

    // Reset table controls styling
    if (tableControls) {
        tableControls.classList.remove('challenge-mode');
        tableControls.classList.remove('active-turn');
    }

    if (!gameState || !playerId) {
        if (tableMessage) tableMessage.textContent = 'Waiting for game...';
        return;
    }

    const isCreator = playerId && gameState.creatorPlayerId === playerId;

    // Handle different game phases
    if (gameState.phase === 0) { // WaitingForPlayers
        if (tableMessage) tableMessage.textContent = 'Waiting for players to join...';

        if (isCreator && startRoundBtn) {
            startRoundBtn.classList.remove('hidden');
            startRoundBtn.textContent = 'Start Round';
        }

        if (isCreator && endGameBtn && gameState.players && gameState.players.length > 0) {
            endGameBtn.classList.remove('hidden');
        }
        return;
    }

    if (gameState.phase === 1) { // InProgress
        if (isCreator && endRoundBtn) {
            endRoundBtn.classList.remove('hidden');
        }

        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        const isMyTurn = currentPlayer && currentPlayer.id === playerId;

        if (!isMyTurn) {
            // Show whose turn it is, and show stored played message if we have one
            const formattedPlayerName = `<span style="font-weight: bold; font-style: italic;">${currentPlayer?.name || 'Someone'}</span>`;
            let message = `Turn: ${formattedPlayerName}`;
            if (window.lastPlayedMessage) {
                message += `      ${window.lastPlayedMessage}`;
            }
            if (tableMessage) tableMessage.innerHTML = message;
            return;
        }

        // Determine if should blink - ALWAYS blink when it's our turn unless we're in interaction state
        if (tableControls && !window.playerInteractionState) {
            tableControls.classList.add('active-turn');
        }

        // Check if there are players with cards remaining (active players)
        const activePlayers = gameState.players.filter(p => p.handCount > 0);
        const playersWithNoCards = gameState.players.filter(p => p.handCount === 0);

        // If only 1 active player remains and there are finished players, only challenges allowed
        if (activePlayers.length === 1 && playersWithNoCards.length > 0) {
            if (selectedCards.length > 0) {
                setSelectedCards([]);
            }

            if (gameState.tablePileCount > 0) {
                const lastPlayerIndex = (gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length;
                const lastPlayer = gameState.players[lastPlayerIndex];

                if (selectedChallengeIndex !== -1) {
                    if (tableMessage) tableMessage.innerHTML = `🎯 Challenge ${lastPlayer.name} - card ${selectedChallengeIndex + 1} selected`;
                    if (tableControls) tableControls.classList.add('challenge-mode');
                    if (confirmChallengeBtn) confirmChallengeBtn.classList.remove('hidden');
                } else {
                    if (tableMessage) tableMessage.innerHTML = `🎯 Click a card from ${lastPlayer.name}'s last play to challenge it`;
                }
            }
            return;
        }

        // Get card play preview
        const cardPlayPreview = getCardPlayPreview();

        // Normal game logic (not end-game situation)
        if (!gameState.announcedRank) {
            if (selectedChallengeIndex !== -1) {
                // In challenge mode
                if (tableMessage) tableMessage.innerHTML = `🎯 Challenge previous player - card ${selectedChallengeIndex + 1} selected`;
                if (tableControls) tableControls.classList.add('challenge-mode');
                if (confirmChallengeBtn) confirmChallengeBtn.classList.remove('hidden');
            } else if (cardPlayPreview || window.lastPlayedMessage) {
                // Show card play preview or stored message with instructions
                const message = cardPlayPreview || window.lastPlayedMessage;
                if (tableMessage) tableMessage.innerHTML = `🎯 ${message} - Choose a rank to declare`;
                if (selectedCards.length > 0) {
                    if (rankSelector) rankSelector.classList.remove('hidden');
                    if (playBtn) {
                        playBtn.classList.remove('hidden');
                        playBtn.textContent = `Play ${selectedCards.length} Card(s)`;
                    }
                }
            } else {
                if (tableMessage) tableMessage.innerHTML = '🎯 Select cards from your hand to play';
            }
        } else {
            const boldRank = `<strong>${gameState.announcedRank}</strong>`;

            if (selectedChallengeIndex !== -1) {
                // In challenge mode
                const previousPlayerIndex = (gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length;
                const previousPlayer = gameState.players[previousPlayerIndex];

                if (tableMessage) tableMessage.innerHTML = `🎯 Challenge ${previousPlayer.name} - card ${selectedChallengeIndex + 1} selected`;
                if (tableControls) tableControls.classList.add('challenge-mode');
                if (confirmChallengeBtn) confirmChallengeBtn.classList.remove('hidden');
            } else if (cardPlayPreview || window.lastPlayedMessage) {
                // Show card play preview or stored message with instructions
                const message = cardPlayPreview || window.lastPlayedMessage;
                if (tableMessage) tableMessage.innerHTML = `🎯 ${message}${CONFIG.MESSAGE_SEPARATOR}Play as ${boldRank} or challenge`;
                if (selectedCards.length > 0) {
                    if (playBtn) {
                        playBtn.classList.remove('hidden');
                        playBtn.textContent = `Play ${selectedCards.length} Card(s) as ${gameState.announcedRank}`;
                    }
                }
            } else {
                if (tableMessage) tableMessage.innerHTML = `🎯 Select cards to play as ${boldRank} or click a previous card to challenge`;
            }
        }
        return;
    }

    if (gameState.phase === 2) { // RoundEnd
        if (tableMessage) tableMessage.textContent = 'Round ended - waiting for next round';
        setSelectedCards([]);
        // Clear stored message and interaction state when round ends
        window.lastPlayedMessage = null;
        window.playerInteractionState = false;

        if (isCreator && startRoundBtn) {
            startRoundBtn.classList.remove('hidden');
            startRoundBtn.textContent = 'Start New Round';
        }

        if (isCreator && endGameBtn) {
            endGameBtn.classList.remove('hidden');
        }
        return;
    }

    if (gameState.phase === 3) { // GameEnd
        // Clear stored message and interaction state when game ends
        window.lastPlayedMessage = null;
        window.playerInteractionState = false;

        if (tableMessage) tableMessage.textContent = 'Game ended';
        return;
    }
}

function getCardPlayPreview() {
    if (selectedCards.length === 0) {
        return null;
    }

    if (!gameState || !gameState.yourHand) {
        return null;
    }

    // Sort hand the same way as in updateHandDisplay
    const sortedHand = [...gameState.yourHand].sort((a, b) => {
        if (a.rank === 'Joker' && b.rank !== 'Joker') return -1;
        if (a.rank !== 'Joker' && b.rank === 'Joker') return 1;
        if (a.rank === 'Joker' && b.rank === 'Joker') return 0;

        const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const aRankIndex = rankOrder.indexOf(a.rank);
        const bRankIndex = rankOrder.indexOf(b.rank);

        if (aRankIndex !== bRankIndex) {
            return aRankIndex - bRankIndex;
        }

        const suitOrder = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
        return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    });

    const cardsToPlay = selectedCards.map(index => sortedHand[index]).filter(card => card);

    if (cardsToPlay.length === 0) {
        return null;
    }

    const cardNames = cardsToPlay.map(card => {
        if (card.rank === 'Joker') {
            return 'Joker';
        } else {
            const suitSymbol = getSuitSymbol(card.suit);
            return `${card.rank}${suitSymbol}`;
        }
    });

    return `<span style="color: #007bff; font-weight: bold;">Will play in order: ${cardNames.join(' → ')} (${cardsToPlay.length} card${cardsToPlay.length === 1 ? '' : 's'})</span>`;
}
