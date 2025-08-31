async function submitChallenge() {
    if (selectedChallengeIndex === -1) {
        alert('Please select a card to flip');
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