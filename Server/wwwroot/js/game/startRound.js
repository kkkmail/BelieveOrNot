// Start a new round
async function startRound() {
    if (!currentMatch || !playerId) {
        alert('Cannot start round: match or player not found');
        return;
    }

    try {
        await connection.invoke("StartRound", currentMatch.matchId, playerId);
    } catch (err) {
        console.error("Failed to start round:", err);
        alert("Failed to start round: " + err);
    }
}