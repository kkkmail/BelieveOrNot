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
        
        // FIXED: Find our player by looking for the most recently added player
        // This works because we're the last player to join
        if (result.players && result.players.length > 0) {
            const ourPlayer = result.players[result.players.length - 1]; // Last player added
            playerId = ourPlayer.id;
            console.log("Set playerId to:", playerId, "for player:", ourPlayer.name);
            
            if (ourPlayer.name !== playerName) {
                console.log(`Name changed from "${playerName}" to "${ourPlayer.name}" due to duplicate`);
                showMessage(`Your name was changed to "${ourPlayer.name}" because "${playerName}" was already taken.`, 5000);
            }
        } else {
            console.error("No players found in match result");
        }

        showGameBoard();
        showMessage(`Joined game! Waiting for other players.`);
    } catch (err) {
        console.error("Failed to join match:", err);
        alert("Failed to join match: " + err);
    }
}