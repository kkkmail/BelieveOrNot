// js/game/joinMatch.js
import { connection, setCurrentMatch, setPlayerId, clientId, setGameState } from "../core/variables.js";
import { showGameBoard } from "./showGameBoard.js";
import { storePlayerName } from "../utils/clientIdUtils.js";
import { setMatchIdInUrl } from "../utils/urlManager.js";
import { addToGameLog } from "../utils/addToGameLog.js";

export async function joinMatch() {
    const playerName = document.getElementById('playerName').value.trim();
    const matchId = document.getElementById('matchId').value.trim();

    if (!playerName || !matchId) {
        alert('Please enter your name and match ID');
        return;
    }

    storePlayerName(playerName);

    try {
        const result = await connection.invoke("JoinMatch", {
            matchId: matchId,
            playerName: playerName,
            clientId: clientId
        });

        if (result.success) {
            setCurrentMatch(result.match);
            setGameState(result.match); // Initial state from match
            setPlayerId(result.playerId);

            console.log("Joined King match, playerId:", result.playerId, "name:", result.assignedName);

            if (result.assignedName !== playerName) {
                console.log(`Name changed from "${playerName}" to "${result.assignedName}" due to duplicate`);
                storePlayerName(result.assignedName);
                alert(`Your name was changed to "${result.assignedName}" because "${playerName}" was already taken.`);
            }

            setMatchIdInUrl(matchId);
            showGameBoard();
            addToGameLog(`Joined game! Waiting for other players.`);
        } else {
            alert("Failed to join match: " + result.message);
        }
    } catch (err) {
        console.error("Failed to join King match:", err);
        let errorMessage = "Failed to join match";
        if (err.message) {
            if (err.message.includes("full")) {
                errorMessage = "This game is full (4 players required).";
            } else if (err.message.includes("not found")) {
                errorMessage = "The game you're trying to join no longer exists.";
            } else if (err.message.includes("in progress")) {
                errorMessage = "This game has already started.";
            } else {
                errorMessage = err.message;
            }
        }
        alert(errorMessage);
    }
}