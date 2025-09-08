// Server/wwwroot/king/js/display/updateGameActions.js
import { gameState, playerId, selectedCard } from "../core/variables.js";
import { updateMessageArea } from "./updateMessageArea.js";
import { addToEventHistory } from "../utils/addToEventHistory.js";

export function updateGameActions() {
    console.log("🎯 updateGameActions() CALLED!!!");
    
    // Look for buttons and controls - King buttons should be loaded dynamically
    const startRoundBtn = document.getElementById('startRoundBtn');
    const endRoundBtn = document.getElementById('endRoundBtn');
    const playCardBtn = document.getElementById('playCardBtn');
    const tableMessage = document.getElementById('tableMessage');
    const tableControls = document.getElementById('tableControls');
    const otherGamesBtn = document.getElementById('otherGamesBtn');

    console.log("=== BUTTON ELEMENT LOOKUPS ===");
    console.log("startRoundBtn:", startRoundBtn);
    console.log("endRoundBtn:", endRoundBtn);
    console.log("playCardBtn:", playCardBtn);
    console.log("otherGamesBtn:", otherGamesBtn);

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
        // Show Other Games button when no game state
        if (otherGamesBtn) otherGamesBtn.classList.remove('hidden');
        return;
    }

    const currentPlayer = gameState.players?.find(p => p.id === playerId);
    const isCreator = currentPlayer?.isCreator || (gameState.players && gameState.players[0]?.id === playerId);
    const isMyTurn = gameState.currentPlayerIndex !== undefined && 
                     gameState.players?.[gameState.currentPlayerIndex]?.id === playerId;

    let shouldBlink = false;

    console.log("=== GAME ACTIONS DEBUG ===");
    console.log("playerId:", playerId);
    console.log("currentPlayer:", currentPlayer);
    console.log("isCreator:", isCreator);
    console.log("players length:", gameState.players?.length);
    console.log("phase:", gameState.phase);
    console.log("isMyTurn:", isMyTurn);

    // Game phase handling
    if (gameState.phase === 0) { // WaitingForPlayers
        console.log("=== WAITING FOR PLAYERS PHASE ===");
        
        // Show start round button for creator when all 4 players have joined
        if (isCreator && gameState.players && gameState.players.length >= 4) {
            console.log("CREATOR: All 4 players joined - showing Start Round button");
            
            if (startRoundBtn) {
                startRoundBtn.classList.remove('hidden');
                console.log("✅ Start Round button shown successfully");
                console.log("Button classes after show:", startRoundBtn.className);
            } else {
                console.error("❌ startRoundBtn not found - King game management controls not loaded properly");
                console.error("Check that loadHtmlContent.js properly replaced the game-management-controls");
                
                // Debug: Show what buttons actually exist
                const allButtons = document.querySelectorAll('.game-management-controls button');
                console.log("Available buttons in game-management-controls:");
                allButtons.forEach(btn => {
                    console.log(`- ${btn.id}: "${btn.textContent}" (classes: ${btn.className})`);
                });
            }
        } else {
            console.log("Start Round button not shown:", {
                isCreator,
                playerCount: gameState.players?.length,
                needs4Players: gameState.players?.length >= 4
            });
        }
        
        // Update table message
        if (tableMessage) {
            const playerCount = gameState.players ? gameState.players.length : 0;
            const playersNeeded = 4 - playerCount;
            
            if (playerCount < 4) {
                tableMessage.innerHTML = `Waiting for ${playersNeeded} more player${playersNeeded === 1 ? '' : 's'} to join...`;
            } else {
                tableMessage.innerHTML = "All players joined! Ready to start round.";
            }
            tableMessage.style.display = 'block';
        }
    } 
    else if (gameState.phase === 1) { // InProgress - Round started
        console.log("=== GAME IN PROGRESS PHASE ===");
        
        // Show end round button for creator
        if (isCreator) {
            console.log("CREATOR: Showing End Round button during game");
            if (endRoundBtn) {
                endRoundBtn.classList.remove('hidden');
            }
        }
        
        // Handle player turn logic
        if (isMyTurn) {
            if (gameState.waitingForTrumpSelection) {
                if (tableMessage) {
                    tableMessage.innerHTML = "🎯 Your turn - Choose trump suit!";
                    tableMessage.style.display = 'block';
                }
                shouldBlink = false; // No blinking during trump selection
            } else if (selectedCard !== null) {
                // Card selected - show play button, COMPLETELY HIDE the message
                if (playCardBtn) {
                    playCardBtn.classList.remove('hidden');
                }
                if (tableMessage) {
                    tableMessage.innerHTML = ""; // Clear the content
                    tableMessage.style.display = 'none'; // Hide the element
                    tableMessage.style.visibility = 'hidden'; // Double ensure it's hidden
                }
                shouldBlink = false;
            } else {
                // No card selected - show turn message and blink
                if (tableMessage) {
                    tableMessage.innerHTML = "🎯 Your turn - Select a card to play!";
                    tableMessage.style.display = 'block';
                    tableMessage.style.visibility = 'visible'; // Ensure it's visible
                }
                shouldBlink = true;
            }
        } else {
            // Not my turn - show whose turn it is
            const currentTurnPlayer = gameState.players?.[gameState.currentPlayerIndex];
            if (tableMessage && currentTurnPlayer) {
                if (gameState.waitingForTrumpSelection) {
                    tableMessage.innerHTML = `${currentTurnPlayer.name} is choosing trump suit...`;
                } else {
                    tableMessage.innerHTML = `${currentTurnPlayer.name}'s turn`;
                }
                tableMessage.style.display = 'block';
                tableMessage.style.visibility = 'visible';
            }
            shouldBlink = false;
        }
    } 
    else if (gameState.phase === 2) { // RoundEnd
        console.log("=== ROUND END PHASE ===");
        
        // Show start round button for creator to start next round
        if (isCreator) {
            console.log("CREATOR: Showing Start Round button for next round");
            if (startRoundBtn) {
                startRoundBtn.classList.remove('hidden');
            }
        }
        
        if (tableMessage) {
            tableMessage.innerHTML = "Round ended - waiting for next round";
            tableMessage.style.display = 'block';
        }
    } 
    else if (gameState.phase === 3) { // GameEnd
        console.log("=== GAME END PHASE ===");
        
        if (tableMessage) {
            tableMessage.innerHTML = "Game ended";
            tableMessage.style.display = 'block';
        }
        
        // Show Other Games button for everyone when game ends
        if (otherGamesBtn) {
            otherGamesBtn.classList.remove('hidden');
        }
    }

    // Apply blinking if needed
    if (shouldBlink && tableControls) {
        tableControls.classList.add('active-turn');
        console.log("Applied blinking to table controls");
    }

    console.log("=== END updateGameActions ===");
    console.log("Final shouldBlink:", shouldBlink);
}