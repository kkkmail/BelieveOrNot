async function playCards() {
    if (selectedCards.length === 0) {
        alert('Please select cards to play');
        return;
    }

    const cardsToPlay = selectedCards.map(index => gameState.yourHand[index]);
    let declaredRank = gameState.announcedRank;

    // If opening turn, get declared rank
    if (!gameState.announcedRank) {
        declaredRank = document.getElementById('declaredRank').value;
    }

    try {
        await connection.invoke("SubmitMove", {
            matchId: gameState.matchId,
            clientCmdId: generateGuid(),
            playerId: playerId,
            action: 0, // Play
            cards: cardsToPlay,
            declaredRank: declaredRank
        });

        selectedCards = [];
        updateActionsDisplay();
    } catch (err) {
        console.error("Failed to play cards:", err);
        alert("Failed to play cards: " + err);
    }
}