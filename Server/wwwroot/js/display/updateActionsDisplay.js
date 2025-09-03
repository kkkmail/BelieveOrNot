// js/display/updateActionsDisplay.js
import {gameState, playerId, selectedCards, setSelectedCards} from "../core/variables.js";

export function updateActionsDisplay() {
    const playBtn = document.getElementById('playBtn');
    const challengeBtn = document.getElementById('challengeBtn');
    const rankSelector = document.getElementById('rankSelector');
    const startRoundBtn = document.getElementById('startRoundBtn');
    const endRoundBtn = document.getElementById('endRoundBtn');
    const endGameBtn = document.getElementById('endGameBtn');

    console.log("=== updateActionsDisplay DEBUG ===");
    console.log("Elements found:", {
        playBtn: !!playBtn,
        challengeBtn: !!challengeBtn,
        rankSelector: !!rankSelector,
        startRoundBtn: !!startRoundBtn,
        endRoundBtn: !!endRoundBtn,
        endGameBtn: !!endGameBtn
    });

    // Hide all by default
    if (playBtn) playBtn.classList.add('hidden');
    if (challengeBtn) challengeBtn.classList.add('hidden');
    if (rankSelector) rankSelector.classList.add('hidden');
    if (startRoundBtn) startRoundBtn.classList.add('hidden');
    if (endRoundBtn) endRoundBtn.classList.add('hidden');
    if (endGameBtn) endGameBtn.classList.add('hidden');

    if (!gameState || !playerId) {
        console.log("Missing gameState or playerId:", {gameState: !!gameState, playerId: !!playerId});
        return;
    }

    console.log("Game state:", {
        phase: gameState.phase,
        currentPlayerIndex: gameState.currentPlayerIndex,
        announcedRank: gameState.announcedRank,
        tablePileCount: gameState.tablePileCount,
        playerId: playerId
    });

    console.log("Selected cards:", selectedCards);

    const isCreator = playerId && gameState.creatorPlayerId === playerId;
    
    // Handle different game phases
    if (gameState.phase === 0) { // WaitingForPlayers
        console.log("Phase 0 - Waiting for players");
        if (isCreator && startRoundBtn) {
            startRoundBtn.classList.remove('hidden');
            startRoundBtn.textContent = 'Start Round';
            console.log("Showed start round button for creator");
        }
        
        // Show end game button for creator when not in round
        if (isCreator && endGameBtn && gameState.players && gameState.players.length > 0) {
            endGameBtn.classList.remove('hidden');
            console.log("Showed end game button for creator");
        }
        return;
    }

    if (gameState.phase === 1) { // InProgress
        console.log("Phase 1 - Game in progress");
        
        // Show end round button for creator during active round
        if (isCreator && endRoundBtn) {
            endRoundBtn.classList.remove('hidden');
            console.log("Showed end round button for creator");
        }
        
        // Continue with normal game logic...
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        const isMyTurn = currentPlayer && currentPlayer.id === playerId;

        console.log("Turn check:", {
            currentPlayer: currentPlayer?.name,
            currentPlayerId: currentPlayer?.id,
            myPlayerId: playerId,
            isMyTurn: isMyTurn
        });

        if (!isMyTurn) {
            console.log("Not my turn, exiting");
            return;
        }

        // Check if there are players with cards remaining (active players)
        const activePlayers = gameState.players.filter(p => p.handCount > 0);
        const playersWithNoCards = gameState.players.filter(p => p.handCount === 0);
        
        console.log("Player status check:", {
            totalPlayers: gameState.players.length,
            activePlayers: activePlayers.length,
            playersWithNoCards: playersWithNoCards.length,
            activePlayerNames: activePlayers.map(p => p.name),
            finishedPlayerNames: playersWithNoCards.map(p => p.name)
        });

        // If only 1 active player remains and there are finished players, only challenges allowed
        if (activePlayers.length === 1 && playersWithNoCards.length > 0) {
            console.log("Only 1 active player remains - only challenge allowed");
            
            // Clear any selected cards since they can't be played
            if (selectedCards.length > 0) {
                setSelectedCards([]);
                console.log("Cleared selected cards - only challenges allowed");
            }
            
            // Only show challenge if there are cards on the table to challenge
            if (gameState.tablePileCount > 0 && challengeBtn) {
                challengeBtn.classList.remove('hidden');
                // Find the last player who played (should be one of the finished players)
                const lastPlayerIndex = (gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length;
                const lastPlayer = gameState.players[lastPlayerIndex];
                challengeBtn.textContent = `Challenge ${lastPlayer.name}`;
                console.log("Challenge button shown for last active player");
            }
            return; // Exit early, don't show any play buttons
        }

        // Normal game logic (not end-game situation)
        if (!gameState.announcedRank) {
            console.log("Opening turn - no announced rank");
            if (selectedCards.length > 0) {
                console.log("Showing play button and rank selector");
                if (rankSelector) {
                    rankSelector.classList.remove('hidden');
                    console.log("Rank selector shown");
                }
                if (playBtn) {
                    playBtn.classList.remove('hidden');
                    playBtn.textContent = `Play ${selectedCards.length} Card(s)`;
                    console.log("Play button shown with text:", playBtn.textContent);
                }
            } else {
                console.log("No cards selected for opening turn");
            }
        } else {
            console.log("Normal turn - announced rank exists:", gameState.announcedRank);

            if (selectedCards.length > 0) {
                console.log("Showing play button for normal turn");
                if (playBtn) {
                    playBtn.classList.remove('hidden');
                    playBtn.textContent = `Play ${selectedCards.length} Card(s) as ${gameState.announcedRank}`;
                    console.log("Play button shown with text:", playBtn.textContent);
                }
            } else {
                console.log("No cards selected, not showing play button");
            }

            if (gameState.tablePileCount > 0) {
                console.log("Showing challenge button");
                const previousPlayerIndex = (gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length;
                const previousPlayer = gameState.players[previousPlayerIndex];

                if (challengeBtn) {
                    challengeBtn.classList.remove('hidden');
                    challengeBtn.textContent = `Challenge ${previousPlayer.name}`;
                    console.log("Challenge button shown");
                }
            }
        }
        return;
    }

    if (gameState.phase === 2) { // RoundEnd
        console.log("Phase 2 - Round ended");
        setSelectedCards([]);
        if (isCreator && startRoundBtn) {
            startRoundBtn.classList.remove('hidden');
            startRoundBtn.textContent = 'Start New Round';
            console.log("Showed start new round button for creator");
        }
        
        // Show end game button for creator when not in round
        if (isCreator && endGameBtn) {
            endGameBtn.classList.remove('hidden');
            console.log("Showed end game button for creator");
        }
        return;
    }

    if (gameState.phase === 3) { // GameEnd
        console.log("Phase 3 - Game ended");
        // Show end game button is hidden, game is over
        return;
    }

    console.log("=== END DEBUG ===");
}