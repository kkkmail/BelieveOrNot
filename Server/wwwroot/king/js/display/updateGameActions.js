// Server/wwwroot/king/js/display/updateGameActions.js
import { gameState, playerId } from "../core/variables.js";

export function updateGameActions() {
    const startRoundBtn = document.getElementById('startRoundBtn');
    const otherGamesBtn = document.getElementById('otherGamesBtn');
    const trumpSelectionArea = document.getElementById('trumpSelectionArea');
    const turnMessage = document.getElementById('turnMessage');

    // Hide all buttons by default
    if (startRoundBtn) startRoundBtn.classList.add('hidden');
    if (otherGamesBtn) otherGamesBtn.classList.add('hidden');
    if (trumpSelectionArea) trumpSelectionArea.classList.add('hidden');

    if (!gameState) {
        // Home page - show Other Games button
        if (otherGamesBtn) {
            otherGamesBtn.classList.remove('hidden');
        }
        if (turnMessage) {
            turnMessage.textContent = 'Create or join a King game to start playing';
        }
        return;
    }

    const isCreator = playerId && gameState.players && gameState.players[0]?.id === playerId;
    const currentPlayer = gameState.players?.[gameState.currentPlayerIndex];
    const isMyTurn = currentPlayer?.id === playerId;

    if (gameState.phase === 0) { // WaitingForPlayers
        if (turnMessage) {
            turnMessage.textContent = `Waiting for players to join (${gameState.players?.length || 0}/4)`;
        }

        if (isCreator && gameState.players?.length === 4) {
            if (startRoundBtn) {
                startRoundBtn.classList.remove('hidden');
                startRoundBtn.textContent = 'Start Round';
            }
        }
        return;
    }

    if (gameState.phase === 1) { // InProgress
        if (gameState.waitingForTrumpSelection) {
            // Show trump selection for the appropriate player
            const currentRound = gameState.currentRound;
            const isTrumpChooser = currentRound?.trumpChooser === playerId;

            if (isTrumpChooser) {
                if (trumpSelectionArea) {
                    trumpSelectionArea.classList.remove('hidden');
                }
                if (turnMessage) {
                    turnMessage.textContent = 'Choose trump suit for this collecting round';
                }
            } else {
                if (turnMessage) {
                    const chooserName = gameState.players?.find(p => p.id === currentRound?.trumpChooser)?.name || 'Someone';
                    turnMessage.textContent = `Waiting for ${chooserName} to choose trump suit`;
                }
            }
            return;
        }

        // Normal play
        if (isMyTurn) {
            if (turnMessage) {
                turnMessage.textContent = 'Your turn - click a card to play it';
                turnMessage.className = 'turn-message current-turn-highlight';
            }
        } else {
            if (turnMessage) {
                turnMessage.textContent = `Waiting for ${currentPlayer?.name || 'current player'} to play`;
                turnMessage.className = 'turn-message';
            }
        }
        return;
    }

    if (gameState.phase === 2) { // RoundEnd
        if (turnMessage) {
            turnMessage.textContent = 'Round ended - waiting for next round';
        }

        if (isCreator) {
            if (startRoundBtn) {
                startRoundBtn.classList.remove('hidden');
                startRoundBtn.textContent = 'Start Next Round';
            }
        }
        return;
    }

    if (gameState.phase === 3) { // GameEnd
        if (turnMessage) {
            turnMessage.textContent = 'Game completed!';
        }

        // Show Other Games button for everyone
        if (otherGamesBtn) {
            otherGamesBtn.classList.remove('hidden');
        }
        return;
    }
}