// js/display/updateActionsDisplay.js
import {gameState, playerId, selectedCards, selectedChallengeIndex, setSelectedCards} from "../core/variables.js";

export function updateActionsDisplay() {
    const playBtn = document.getElementById('playBtn');
    const confirmChallengeBtn = document.getElementById('confirmChallengeBtn');
    const rankSelector = document.getElementById('rankSelector');
    const startRoundBtn = document.getElementById('startRoundBtn');
    const endRoundBtn = document.getElementById('endRoundBtn');
    const endGameBtn = document.getElementById('endGameBtn');
    const tableMessage = document.getElementById('tableMessage');
    const tableControls = document.getElementById('tableControls');

    console.log("=== updateActionsDisplay DEBUG ===");

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
    }

    if (!gameState || !playerId) {
        if (tableMessage) tableMessage.textContent = 'Waiting for game...';
        console.log("Missing gameState or playerId");
        return;
    }

    const isCreator = playerId && gameState.creatorPlayerId === playerId;
    
    // Handle different game phases
    if (gameState.phase === 0) { // WaitingForPlayers
        console.log("Phase 0 - Waiting for players");
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
        console.log("Phase 1 - Game in progress");
        
        if (isCreator && endRoundBtn) {
            endRoundBtn.classList.remove('hidden');
        }
        
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        const isMyTurn = currentPlayer && currentPlayer.id === playerId;

        if (!isMyTurn) {
            if (tableMessage) tableMessage.textContent = `${currentPlayer?.name || 'Someone'}'s turn`;
            console.log("Not my turn, exiting");
            return;
        }

        // Check if there are players with cards remaining (active players)
        const activePlayers = gameState.players.filter(p => p.handCount > 0);
        const playersWithNoCards = gameState.players.filter(p => p.handCount === 0);

        // If only 1 active player remains and there are finished players, only challenges allowed
        if (activePlayers.length === 1 && playersWithNoCards.length > 0) {
            console.log("Only 1 active player remains - only challenge allowed");
            
            if (selectedCards.length > 0) {
                setSelectedCards([]);
            }
            
            if (gameState.tablePileCount > 0) {
                const lastPlayerIndex = (gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length;
                const lastPlayer = gameState.players[lastPlayerIndex];
                
                if (selectedChallengeIndex !== -1) {
                    if (tableMessage) tableMessage.textContent = `Challenge ${lastPlayer.name} - card ${selectedChallengeIndex + 1} selected`;
                    if (tableControls) tableControls.classList.add('challenge-mode');
                    if (confirmChallengeBtn) confirmChallengeBtn.classList.remove('hidden');
                } else {
                    if (tableMessage) tableMessage.textContent = `Click a card from ${lastPlayer.name}'s last play to challenge it`;
                }
            }
            return;
        }

        // Normal game logic (not end-game situation)
        if (!gameState.announcedRank) {
            console.log("Opening turn - no announced rank");
            
            if (selectedChallengeIndex !== -1) {
                // In challenge mode
                if (tableMessage) tableMessage.textContent = `Challenge previous player - card ${selectedChallengeIndex + 1} selected`;
                if (tableControls) tableControls.classList.add('challenge-mode');
                if (confirmChallengeBtn) confirmChallengeBtn.classList.remove('hidden');
            } else if (selectedCards.length > 0) {
                // In play mode
                if (tableMessage) tableMessage.textContent = 'Choose a rank to declare for your cards';
                if (rankSelector) rankSelector.classList.remove('hidden');
                if (playBtn) {
                    playBtn.classList.remove('hidden');
                    playBtn.textContent = `Play ${selectedCards.length} Card(s)`;
                }
            } else {
                if (tableMessage) tableMessage.textContent = 'Select cards from your hand to play';
            }
        } else {
            console.log("Normal turn - announced rank exists:", gameState.announcedRank);

            if (selectedChallengeIndex !== -1) {
                // In challenge mode
                const previousPlayerIndex = (gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length;
                const previousPlayer = gameState.players[previousPlayerIndex];
                
                if (tableMessage) tableMessage.textContent = `Challenge ${previousPlayer.name} - card ${selectedChallengeIndex + 1} selected`;
                if (tableControls) tableControls.classList.add('challenge-mode');
                if (confirmChallengeBtn) confirmChallengeBtn.classList.remove('hidden');
            } else if (selectedCards.length > 0) {
                // In play mode
                if (tableMessage) tableMessage.textContent = `Play cards as ${gameState.announcedRank} or click a previous card to challenge`;
                if (playBtn) {
                    playBtn.classList.remove('hidden');
                    playBtn.textContent = `Play ${selectedCards.length} Card(s) as ${gameState.announcedRank}`;
                }
            } else {
                if (tableMessage) tableMessage.textContent = `Select cards to play as ${gameState.announcedRank} or click a previous card to challenge`;
            }
        }
        return;
    }

    if (gameState.phase === 2) { // RoundEnd
        console.log("Phase 2 - Round ended");
        if (tableMessage) tableMessage.textContent = 'Round ended - waiting for next round';
        setSelectedCards([]);
        
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
        console.log("Phase 3 - Game ended");
        if (tableMessage) tableMessage.textContent = 'Game ended';
        return;
    }

    console.log("=== END DEBUG ===");
}