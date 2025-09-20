// Server/wwwroot/king/js/actions/createMatch.js
import { connection, playerId, setCurrentMatch, setPlayerId, setGameState } from "../core/variables.js";
import { showGameBoard } from "../utils/showGameBoard.js";
import { storePlayerName } from "../../../js/utils/playerIdUtils.js";
import { updateGameDisplay } from "../display/updateGameDisplay.js";
import { customAlert } from "../../../js/utils/customAlert.js";

export async function createMatch() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        await customAlert('Please enter your name');
        return;
    }

    // Store the player name in cookie for future sessions
    storePlayerName(playerName);

    const settings = {
        includeAvoidEverythingRound: document.getElementById('includeAvoidEverythingRound').value === 'true',
        collectingPhaseRounds: parseInt(document.getElementById('collectingPhaseRounds').value)
    };

    try {
        const result = await connection.invoke("CreateOrJoinKingMatch", {
            playerName: playerName,
            settings: settings,
            playerId: playerId
        });

        setCurrentMatch(result);
        setGameState(result);

        // Creator is always the first player
        if (result.players && result.players.length > 0) {
            const ourPlayer = result.players[0];
            setPlayerId(ourPlayer.id);
            console.log("Set playerId to:", playerId, "for creator:", ourPlayer.name);
        } else {
            console.error("No players found in King match result");
        }

        // Set match ID in URL using unified structure
        const url = new URL(window.location.origin);
        url.searchParams.set('game', 'king');
        url.searchParams.set('match', result.matchId);
        window.history.replaceState({}, '', url);
        console.log('King match URL set to unified structure:', url.toString());

        showGameBoard();
        updateGameDisplay();

        console.log("King match created successfully");
    } catch (err) {
        console.error("Failed to create King match:", err);
        await customAlert("Failed to create King match: " + err);
    }
}
