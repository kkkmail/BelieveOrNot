// js/game/joinMatch.js
import {playerId, connection, setCurrentMatch, setPlayerId, clientId} from "../core/variables.js";
import {showMessage} from "../utils/showMessage.js";
import {showGameBoard} from "./showGameBoard.js";
import {setMatchIdInUrl} from "../utils/urlManager.js";
import {customAlert} from "../utils/customAlert.js";
import {storePlayerName} from "../utils/clientIdUtils.js";
import {routeToCorrectGame} from "../utils/gameRouter.js";

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

    // Hide Other Games button immediately when joining
    const otherGamesBtn = document.getElementById('otherGamesBtn');
    if (otherGamesBtn) {
        otherGamesBtn.classList.add('hidden');
    }

    // Store the player name in cookie for future sessions
    storePlayerName(playerName);

    try {
        const result = await connection.invoke("JoinExistingMatch", matchId, playerName, clientId);

        if (result.success) {
            setCurrentMatch(result.match);
            setPlayerId(result.playerId);

            console.log("Set playerId to:", playerId, "for player:", result.assignedName);

            if (result.assignedName !== playerName) {
                console.log(`Name changed from "${playerName}" to "${result.assignedName}" due to duplicate`);

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
            showMessage(`Joined game! Waiting for other players.`);
        } else {
            await customAlert("Failed to join match: " + result.message);
        }
    } catch (err) {
        console.error("Failed to join match:", err);

        let errorMessage = "Failed to join match";
        if (err.message) {
            if (err.message.includes("already started")) {
                errorMessage = "This game has already started and new players cannot join.";
            } else if (err.message.includes("not found")) {
                errorMessage = "The game you're trying to join no longer exists or has ended.";
            } else if (err.message.includes("Invalid match ID")) {
                errorMessage = "Invalid match ID format. Please check the match ID and try again.";
            } else {
                errorMessage = err.message;
            }
        }

        await customAlert(errorMessage, 'Join Failed');
    }
}