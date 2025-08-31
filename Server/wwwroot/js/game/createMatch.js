// Create a new match
async function createMatch() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }

    const settings = {
        deckSize: parseInt(document.getElementById('deckSize').value),
        jokerCount: parseInt(document.getElementById('jokerCount').value),
        jokerDisposalEnabled: parseInt(document.getElementById('jokerCount').value) >= 4
    };

    try {
        const result = await connection.invoke("CreateOrJoinMatch", {
            playerName: playerName,
            settings: settings
        });

        currentMatch = result;
        // Find our player ID by name since we're the creator
        const ourPlayer = result.players.find(p => p.name === playerName);
        if (ourPlayer) {
            playerId = ourPlayer.id;
            console.log("Set playerId to:", playerId);
        }

        showGameBoard();
        showMessage(`Game created! Share the Match ID with others to join.`);

        // Show start button if enough players
        if (result.players && result.players.length >= 2) {
            document.getElementById('startRoundBtn').classList.remove('hidden');
        }
    } catch (err) {
        console.error("Failed to create match:", err);
        alert("Failed to create match: " + err);
    }
}