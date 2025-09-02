async function playCards() {
    if (selectedCards.length === 0) {
        alert('Please select cards to play');
        return;
    }

    // Get the actual card objects from sorted display
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

    const cardsToPlay = selectedCards.map(index => sortedHand[index]);
    let declaredRank = gameState.announcedRank;

    // If opening turn, get declared rank and validate
    if (!gameState.announcedRank) {
        declaredRank = document.getElementById('declaredRank').value;
        
        if (!declaredRank || declaredRank === '') {
            alert('Please choose a rank from the dropdown before playing cards.');
            return;
        }
    }

    console.log("Playing cards:", cardsToPlay.map(c => `${c.rank} of ${c.suit}`));

    try {
        // FIXED: Set flag to show "Played" instead of "Will play"
        window.cardsJustPlayed = true;
        updateCardPlayPreview();

        await connection.invoke("SubmitMove", {
            matchId: gameState.matchId,
            clientCmdId: generateGuid(),
            playerId: playerId,
            action: 0, // Play
            cards: cardsToPlay,
            declaredRank: declaredRank
        });

        // Clear selected cards immediately after successful play
        selectedCards = [];
        console.log("Selected cards cleared after play");
        
        // Update displays to reflect cleared selection
        updateHandDisplay();
        updateActionsDisplay();
    } catch (err) {
        console.error("Failed to play cards:", err);
        alert("Failed to play cards: " + err);
        
        // FIXED: Clear flag if play failed
        window.cardsJustPlayed = false;
        updateCardPlayPreview();
    }
}