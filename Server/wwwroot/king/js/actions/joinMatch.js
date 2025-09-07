// Server/wwwroot/king/js/actions/joinMatch.js
import { connection, setCurrentMatch, setPlayerId, setGameState, clientId } from "../core/variables.js";
import { showGameBoard } from "../utils/showGameBoard.js";
import { setMatchIdInUrl } from "../../../js/utils/urlManager.js";
import { customAlert } from "../../../js/utils/customAlert.js";
import { storePlayerName } from "../../../js/utils/clientIdUtils.js";
import { routeToCorrectGame } from "../../../js/utils/gameRouter.js";

export async function joinMatch() {
    const playerName = document.getElementById('playerName').value.trim();
    const matchId = document.getElementById('matchId').value.trim();

    if (!playerName || !matchId) {
        await customAlert('Please enter your name and match ID');
        return;
    }

    // Check if this match belongs to a different game
    const shouldRedirect = await routeToCorrectGame(matchId);
    if (shouldRedirect) {
        return; // Redirecting to different game
    }

    // Store the player name in cookie for future sessions
    storePlayerName(playerName);

    try {
        const result = await connection.invoke("JoinExistingMatch", matchId, playerName, clientId);

        if (result.success) {
            setCurrentMatch(result.match);
            setGameState(result.match); // Set gameState as well for consistency
            setPlayerId(result.playerId);

            console.log("Set King playerId to:", result.playerId, "for player:", result.assignedName);

            if (result.assignedName !== playerName) {
                console.log(`King name changed from "${playerName}" to "${result.assignedName}" due to duplicate`);

                // Store the assigned name instead of the original name
                storePlayerName(result.assignedName);

                // Format the message with HTML styling
                const originalName = `<span style="font-weight: bold; font-style: italic;">${playerName}</span>`;
                const newName = `<span style="font-weight: bold; font-style: italic;">${result.assignedName}</span>`;

                await customAlert(
                    `Your name was changed to ${newName} because ${originalName} was already taken.`,
                    'Name Changed'
                );
            }

            // Set match ID in URL for reconnection
            setMatchIdInUrl(matchId);

            showGameBoard();
            console.log("Joined King game successfully");
        } else {
            await customAlert("Failed to join King match: " + result.message);
        }
    } catch (err) {
        console.error("Failed to join King match:", err);

        let errorMessage = "Failed to join King match";
        if (err.message) {
            if (err.message.includes("already started")) {
                errorMessage = "This King game has already started and new players cannot join.";
            } else if (err.message.includes("not found")) {
                errorMessage = "The King game you're trying to join no longer exists or has ended.";
            } else if (err.message.includes("full")) {
                errorMessage = "This King game is full (4 players maximum).";
            } else {
                errorMessage = "Failed to join King match: " + err.message;
            }
        }

        await customAlert(errorMessage);
    }
}