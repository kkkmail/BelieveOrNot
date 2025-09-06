// js/game/createMatch.js
import {showMessage} from "../utils/showMessage.js";
import {showGameBoard} from "./showGameBoard.js";
import {connection, playerId, currentMatch, setCurrentMatch, setPlayerId, clientId} from "../core/variables.js";
import {setMatchIdInUrl} from "../utils/urlManager.js";
import {storePlayerName} from "../utils/clientIdUtils.js";

export async function createMatch() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }

    // Store the player name in cookie for future sessions
    storePlayerName(playerName);

    const settings = {
        deckSize: parseInt(document.getElementById('deckSize').value),
        jokerCount: parseInt(document.getElementById('jokerCount').value),
        jokerDisposalEnabled: parseInt(document.getElementById('jokerCount').value) >= 4
    };

    try {
        const result = await connection.invoke("CreateOrJoinMatch", {
            playerName: playerName,
            settings: settings,
            clientId: clientId // Include client ID for reconnection
        });

        setCurrentMatch(result);

        // Creator is always the first player, so use index 0
        if (result.players && result.players.length > 0) {
            const ourPlayer = result.players[0]; // Creator is always first
            setPlayerId(ourPlayer.id);
            console.log("Set playerId to:", playerId, "for creator:", ourPlayer.name);

            // Creator name shouldn't change, but check just in case
            if (ourPlayer.name !== playerName) {
                console.log(`Creator name changed from "${playerName}" to "${ourPlayer.name}"`);
            }
        } else {
            console.error("No players found in match result");
        }

        // Set match ID in URL for easy sharing and reconnection
        setMatchIdInUrl(result.matchId);

        showGameBoard();
        showMessage(`Game created! Share the URL or Match ID with others to join.`);

        // Show start button if enough players
        if (result.players && result.players.length >= 2) {
            document.getElementById('startRoundBtn').classList.remove('hidden');
        }
    } catch (err) {
        console.error("Failed to create match:", err);
        alert("Failed to create match: " + err);
    }
}