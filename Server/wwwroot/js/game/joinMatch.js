// js/game/joinMatch.js
import {playerId, connection, setCurrentMatch, setPlayerId, clientId} from "../core/variables.js";
import {showMessage} from "../utils/showMessage.js";
import {showGameBoard} from "./showGameBoard.js";
import {setMatchIdInUrl} from "../utils/urlManager.js";

export async function joinMatch() {
    const playerName = document.getElementById('playerName').value.trim();
    const matchId = document.getElementById('matchId').value.trim();

    if (!playerName || !matchId) {
        alert('Please enter your name and match ID');
        return;
    }

    try {
        const result = await connection.invoke("JoinExistingMatch", matchId, playerName, clientId);
        
        if (result.success) {
            setCurrentMatch(result.match);
            setPlayerId(result.playerId);
            
            console.log("Set playerId to:", playerId, "for player:", result.assignedName);

            if (result.assignedName !== playerName) {
                console.log(`Name changed from "${playerName}" to "${result.assignedName}" due to duplicate`);
                showMessage(`Your name was changed to "${result.assignedName}" because "${playerName}" was already taken.`, 5000);
            }

            // Set match ID in URL for reconnection
            setMatchIdInUrl(matchId);

            showGameBoard();
            showMessage(`Joined game! Waiting for other players.`);
        } else {
            alert("Failed to join match: " + result.message);
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
        
        alert(errorMessage);
    }
}