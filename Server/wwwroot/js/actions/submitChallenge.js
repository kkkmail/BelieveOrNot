async function submitChallenge() {
    if (selectedChallengeIndex === -1) {
        alert('Please select a card to flip');
        return;
    }

    // Show confirmation dialog
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isMyTurn = currentPlayer && currentPlayer.id === playerId;
    const targetPlayer = isMyTurn 
        ? gameState.players[(gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length]
        : currentPlayer;

    const confirmed = confirm(
        `Are you sure you want to challenge ${targetPlayer?.name || 'the previous player'}?\n` +
        `You are challenging that card ${selectedChallengeIndex + 1} is NOT a ${gameState.announcedRank}.`
    );

    if (!confirmed) {
        return;
    }

    try {
        await connection.invoke("SubmitMove", {
            matchId: gameState.matchId,
            clientCmdId: generateGuid(),
            playerId: playerId,
            action: 1, // Challenge
            challengePickIndex: selectedChallengeIndex
        });

        hideChallenge();
        selectedChallengeIndex = -1;
    } catch (err) {
        console.error("Failed to challenge:", err);
        alert("Failed to challenge: " + err);
    }
}