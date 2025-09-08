// Server/wwwroot/king/js/display/updateGameActions.js
import { gameState, playerId, selectedCard } from "../core/variables.js";
import { updateMessageArea } from "./updateMessageArea.js";

export function updateGameActions() {
    console.log("🎯 updateGameActions() CALLED!!!");
    
    // Look for buttons and controls
    const startRoundBtn = document.getElementById('startRoundBtn');
    const endRoundBtn = document.getElementById('endRoundBtn');
    const playCardBtn = document.getElementById('playCardBtn');
    const tableMessage = document.getElementById('tableMessage');
    const tableControls = document.getElementById('tableControls');
    const otherGamesBtn = document.getElementById('otherGamesBtn');

    // Hide all buttons initially
    [startRoundBtn, endRoundBtn, playCardBtn, otherGamesBtn].forEach(btn => {
        if (btn) btn.classList.add('hidden');
    });

    // Remove blinking initially
    if (tableControls) tableControls.classList.remove('active-turn');

    // Update message area (for broadcasts)
    updateMessageArea();

    if (!gameState) {
        if (tableMessage) tableMessage.textContent = "Loading...";
        return;
    }

    const currentPlayer = gameState.players?.find(p => p.id === playerId);
    const isCreator = currentPlayer?.isCreator || (gameState.players && gameState.players[0]?.id === playerId);
    const isMyTurn = gameState.currentPlayerIndex !== undefined && 
                     gameState.players?.[gameState.currentPlayerIndex]?.id === playerId;

    let shouldBlink = false;

    // Game phase handling
    if (gameState.phase === 0) { // WaitingForPlayers
        if (isCreator && gameState.players && gameState.players.length >= 4) {
            startRoundBtn?.classList.remove('hidden');
        }
        if (tableMessage) tableMessage.textContent = "Waiting for round to start";
    } 
    else if (gameState.phase === 1) { // InProgress
        if (isCreator) {
            endRoundBtn?.classList.remove('hidden');
        }
        
        if (isMyTurn) {
            if (gameState.waitingForTrumpSelection) {
                if (tableMessage) tableMessage.innerHTML = "🎯 Your turn - Choose trump suit!";
                shouldBlink = true;
            } else if (selectedCard !== null) {
                // Card selected - show play button, HIDE turn message
                playCardBtn?.classList.remove('hidden');
                if (tableMessage) tableMessage.style.display = 'none'; // Hide message when button shown
                shouldBlink = false;
                window.playerInteractionState = true;
            } else {
                // No card selected - show blinking turn message
                if (tableMessage) {
                    tableMessage.innerHTML = "🎯 Your turn - Select a card to play";
                    tableMessage.style.display = 'block'; // Show message
                }
                shouldBlink = true;
                window.playerInteractionState = false;
            }
        } else {
            // Not my turn - show whose turn it is
            const currentPlayerName = gameState.players?.[gameState.currentPlayerIndex]?.name || "Unknown";
            if (tableMessage) {
                tableMessage.innerHTML = `Waiting for <span style="font-weight: bold; font-style: italic;">${currentPlayerName}</span>`;
                tableMessage.style.display = 'block';
            }
            shouldBlink = false;
        }
    } 
    else if (gameState.phase === 2) { // RoundEnd
        if (isCreator) {
            startRoundBtn?.classList.remove('hidden');
        }
        if (tableMessage) {
            tableMessage.textContent = "Round ended";
            tableMessage.style.display = 'block';
        }
    } 
    else if (gameState.phase === 3) { // GameEnd
        if (tableMessage) {
            tableMessage.textContent = "Game finished!";
            tableMessage.style.display = 'block';
        }
        otherGamesBtn?.classList.remove('hidden');
    }

    // Apply blinking when appropriate
    if (shouldBlink && tableControls && !window.playerInteractionState) {
        tableControls.classList.add('active-turn');
    }
}