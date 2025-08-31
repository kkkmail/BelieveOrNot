// Join an existing match
async function joinMatch() {
    const playerName = document.getElementById('playerName').value.trim();
    const matchId = document.getElementById('matchId').value.trim();

    if (!playerName || !matchId) {
        alert('Please enter your name and match ID');
        return;
    }

    try {
        const result = await connection.invoke("JoinExistingMatch", matchId, playerName);
        currentMatch = result;
        // Find our player ID by name since we just joined
        const ourPlayer = result.players.find(p => p.name === playerName);
        if (ourPlayer) {
            playerId = ourPlayer.id;
            console.log("Set playerId to:", playerId);
        }

        showGameBoard();
        showMessage(`Joined game! Waiting for other players.`);
    } catch (err) {
        console.error("Failed to join match:", err);
        alert("Failed to join match: " + err);
    }
}