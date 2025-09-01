function updateActionsDisplay() {
    const playBtn = document.getElementById('playBtn');
    const challengeBtn = document.getElementById('challengeBtn');
    const rankSelector = document.getElementById('rankSelector');
    const startRoundBtn = document.getElementById('startRoundBtn');

    console.log("=== updateActionsDisplay DEBUG ===");
    console.log("Elements found:", {
        playBtn: !!playBtn,
        challengeBtn: !!challengeBtn,
        rankSelector: !!rankSelector,
        startRoundBtn: !!startRoundBtn
    });

    // Hide all by default
    if (playBtn) playBtn.classList.add('hidden');
    if (challengeBtn) challengeBtn.classList.add('hidden');
    if (rankSelector) rankSelector.classList.add('hidden');
    if (startRoundBtn) startRoundBtn.classList.add('hidden');

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

    // Handle different game phases
    if (gameState.phase === 0) { // WaitingForPlayers
        console.log("Phase 0 - Waiting for players");
        if (playerId && gameState.creatorPlayerId === playerId && startRoundBtn) {
            startRoundBtn.classList.remove('hidden');
            startRoundBtn.textContent = 'Start Round';
            console.log("Showed start round button for creator");
        }
        return;
    }

    if (gameState.phase === 2) { // RoundEnd
        console.log("Phase 2 - Round ended");
        selectedCards = [];
        if (playerId && gameState.creatorPlayerId === playerId && startRoundBtn) {
            startRoundBtn.classList.remove('hidden');
            startRoundBtn.textContent = 'Start New Round';
            console.log("Showed start new round button for creator");
        }
        return;
    }

    if (gameState.phase === 3) { // GameEnd
        console.log("Phase 3 - Game ended");
        return;
    }

    if (gameState.phase !== 1) {
        console.log("Phase is not 1 (InProgress), phase:", gameState.phase);
        return;
    }

    // Check if it's our turn
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

    // Special 2-player rule
    const playersWithNoCards = gameState.players.filter(p => p.handCount === 0);
    const is2PlayerWithZeroCards = gameState.players.length === 2 && playersWithNoCards.length > 0;

    console.log("2-player check:", {
        playerCount: gameState.players.length,
        playersWithNoCards: playersWithNoCards.length,
        is2PlayerWithZeroCards: is2PlayerWithZeroCards
    });

    if (!gameState.announcedRank) {
        console.log("Opening turn - no announced rank");
        if (selectedCards.length > 0 && !is2PlayerWithZeroCards) {
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
            console.log("Not showing play button:", {
                selectedCardsLength: selectedCards.length,
                is2PlayerWithZeroCards: is2PlayerWithZeroCards
            });
        }
    } else {
        console.log("Normal turn - announced rank exists:", gameState.announcedRank);
        
        if (is2PlayerWithZeroCards) {
            console.log("2-player special case - showing challenge only");
            if (gameState.tablePileCount > 0 && challengeBtn) {
                challengeBtn.classList.remove('hidden');
                const opponentWithZeroCards = playersWithNoCards[0];
                challengeBtn.textContent = `Challenge ${opponentWithZeroCards.name}`;
                console.log("Challenge button shown");
            }
        } else {
            console.log("Normal turn logic");
            
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
    }

    console.log("=== END DEBUG ===");
}