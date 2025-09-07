// Server/wwwroot/king/js/display/updateGameActions.js
import { gameState, playerId, selectedCard } from "../core/variables.js";

export function updateGameActions() {
    console.log("🎯 updateGameActions() CALLED!!!");
    
    // Look for buttons in both game board AND management controls
    const startRoundBtn = document.getElementById('startRoundBtn'); // In management controls
    const endRoundBtn = document.getElementById('endRoundBtn'); // In game board
    const playCardBtn = document.getElementById('playCardBtn'); // In game board
    const turnMessage = document.getElementById('turnMessage'); // In game board
    const otherGamesBtn = document.getElementById('otherGamesBtn'); // In management controls

    console.log("DOM elements found:", {
        startRoundBtn: !!startRoundBtn,
        endRoundBtn: !!endRoundBtn,
        playCardBtn: !!playCardBtn,
        turnMessage: !!turnMessage,
        otherGamesBtn: !!otherGamesBtn
    });

    // Hide all buttons initially
    [startRoundBtn, endRoundBtn, playCardBtn, otherGamesBtn].forEach(btn => {
        if (btn) btn.classList.add('hidden');
    });

    if (!gameState) {
        if (turnMessage) turnMessage.textContent = "Loading...";
        return;
    }

    console.log("=== KING GAME ACTIONS DEBUG ===");
    console.log("gameState.phase:", gameState.phase);
    console.log("playerId:", playerId);
    console.log("gameState.players:", gameState.players);

    // Check if current player is creator (first player in the array OR has isCreator property)
    const currentPlayer = gameState.players?.find(p => p.id === playerId);
    const isCreator = currentPlayer?.isCreator || (gameState.players && gameState.players[0]?.id === playerId);
    const isMyTurn = gameState.currentPlayerIndex !== undefined && 
                     gameState.players?.[gameState.currentPlayerIndex]?.id === playerId;

    console.log("currentPlayer:", currentPlayer);
    console.log("isCreator:", isCreator);
    console.log("gameState.players.length:", gameState.players?.length);

    // Check button styles
    if (startRoundBtn) {
        console.log("startRoundBtn classes:", startRoundBtn.className);
        console.log("startRoundBtn style.display:", startRoundBtn.style.display);
        console.log("startRoundBtn computed style:", window.getComputedStyle(startRoundBtn).display);
    }

    // Show buttons based on game phase and player status
    if (gameState.phase === 0) { // WaitingForPlayers
        if (turnMessage) {
            turnMessage.textContent = `Waiting for players to join (${gameState.players?.length || 0}/4)`;
        }

        if (isCreator) {
            console.log("CREATOR DETECTED - Players:", gameState.players?.length);
            if (gameState.players?.length === 4) {
                console.log("4 PLAYERS JOINED - SHOWING START BUTTON");
                if (startRoundBtn) {
                    console.log("REMOVING HIDDEN CLASS FROM START BUTTON");
                    startRoundBtn.classList.remove('hidden');
                    startRoundBtn.textContent = 'Start Round';
                    console.log("Start button classes after removing hidden:", startRoundBtn.className);
                }
            } else {
                console.log("NOT ENOUGH PLAYERS YET");
            }
        } else {
            console.log("NOT CREATOR - NO BUTTONS");
        }
        return;
    } 
    else if (gameState.phase === 1) { // InProgress
        // Show end round button for game creator (similar to BelieveOrNot)
        if (isCreator) {
            endRoundBtn?.classList.remove('hidden');
        }

        if (gameState.waitingForTrumpSelection) {
            if (isMyTurn) {
                if (turnMessage) turnMessage.textContent = "Choose trump suit";
            } else {
                const currentPlayerName = gameState.players?.[gameState.currentPlayerIndex]?.name || "Unknown";
                if (turnMessage) turnMessage.textContent = `Waiting for ${currentPlayerName} to choose trump`;
            }
        } 
        else if (isMyTurn) {
            // Show play card button if a card is selected (BelieveOrNot pattern)
            if (selectedCard !== null) {
                console.log("CARD SELECTED - SHOWING PLAY BUTTON, selectedCard:", selectedCard);
                playCardBtn?.classList.remove('hidden');
            }
            if (turnMessage) turnMessage.textContent = "Your turn - select a card to play";
        } 
        else {
            const currentPlayerName = gameState.players?.[gameState.currentPlayerIndex]?.name || "Unknown";
            if (turnMessage) turnMessage.textContent = `Waiting for ${currentPlayerName}`;
        }
    } 
    else if (gameState.phase === 2) { // RoundEnd
        if (isCreator) {
            startRoundBtn?.classList.remove('hidden');
        }
        if (turnMessage) turnMessage.textContent = "Round ended";
    } 
    else if (gameState.phase === 3) { // GameEnd
        if (turnMessage) turnMessage.textContent = "Game finished!";
    }
}