// js/game/createMatch.js
import { connection, setCurrentMatch, setPlayerId, clientId, setGameState } from "../core/variables.js";
import { showGameBoard } from "./showGameBoard.js";
import { storePlayerName } from "../../../js/utils/clientIdUtils.js"; // Reuse from BelieveOrNot
import { setMatchIdInUrl } from "../utils/urlManager.js";
import { showMessage } from "../../../js/utils/showMessage.js"; // Reuse from BelieveOrNot
import { updateGameDisplay } from "../display/updateGameDisplay.js";

export async function createMatch() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }

    const settings = {
        includeDontTakeAnything: document.getElementById('includeDontTakeAnything').checked,
        eightCollectingRounds: document.getElementById('collectingRounds').value === 'true'
    };

    storePlayerName(playerName);

    try {
        const result = await connection.invoke("CreateMatch", {
            playerName: playerName,
            settings: settings,
            clientId: clientId
        });

        setCurrentMatch({ id: result.matchId });
        setPlayerId(result.players[0].id);

        // Create proper game state structure
        const initialGameState = {
            matchId: result.matchId,
            phase: result.phase,
            players: result.players.map(p => ({
                id: p.id,
                name: p.name,
                handCount: p.handCount,
                score: p.score,
                isConnected: p.isConnected,
                position: p.position
            })),
            currentRoundIndex: result.currentRoundIndex || 0,
            currentRoundName: result.currentRoundName || "Waiting for Players",
            currentRoundDescription: result.currentRoundDescription || "",
            isCollectingPhase: result.isCollectingPhase || false,
            currentPlayerIndex: result.currentPlayerIndex || 0,
            leaderPlayerIndex: result.leaderPlayerIndex || 0,
            currentTrump: result.currentTrump || null,
            trumpSetterIndex: result.trumpSetterIndex || 0,
            currentTrick: result.currentTrick || [],
            currentTrickPlayerOrder: result.currentTrickPlayerOrder || [],
            creatorPlayerId: result.players[0].id,
            totalRounds: result.totalRounds || 0,
            canSelectTrump: false,
            waitingForTrumpSelection: false,
            yourHand: result.yourHand || []
        };

        setGameState(initialGameState);
        setMatchIdInUrl(result.matchId);
        showGameBoard();
        updateGameDisplay();
        showMessage(`Game created! Share the URL or Match ID with others to join.`);

        console.log("King match created successfully:", result);
    } catch (err) {
        console.error("Failed to create King match:", err);
        alert("Failed to create match: " + (err.message || err));
    }
}
// js/game/joinMatch.js
import { connection, setCurrentMatch, setPlayerId, clientId, setGameState } from "../core/variables.js";
import { showGameBoard } from "./showGameBoard.js";
import { storePlayerName } from "../../../js/utils/clientIdUtils.js"; // Reuse from BelieveOrNot
import { setMatchIdInUrl } from "../utils/urlManager.js";
import { showMessage } from "../../../js/utils/showMessage.js"; // Reuse from BelieveOrNot
import { updateGameDisplay } from "../display/updateGameDisplay.js";

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
            setPlayerId(result.playerId);

            console.log("Joined King match, playerId:", result.playerId, "name:", result.assignedName);

            if (result.assignedName !== playerName) {
                console.log(`Name changed from "${playerName}" to "${result.assignedName}" due to duplicate`);
                storePlayerName(result.assignedName);
                alert(`Your name was changed to "${result.assignedName}" because "${playerName}" was already taken.`);
            }

            setMatchIdInUrl(matchId);
            showGameBoard();
            
            // Create initial game state from match data
            const initialGameState = {
                matchId: result.match.id,
                phase: result.match.phase,
                players: result.match.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    handCount: p.hand?.length || 0,
                    score: p.score,
                    isConnected: p.isConnected,
                    position: p.position
                })),
                currentRoundIndex: result.match.currentRoundIndex,
                currentRoundName: result.match.currentRound?.name || "Waiting",
                currentRoundDescription: result.match.currentRound?.description || "",
                isCollectingPhase: result.match.currentRound?.isCollectingPhase || false,
                currentPlayerIndex: result.match.currentPlayerIndex,
                leaderPlayerIndex: result.match.leaderPlayerIndex,
                currentTrump: result.match.currentTrump,
                trumpSetterIndex: result.match.trumpSetterIndex,
                currentTrick: result.match.currentTrick || [],
                currentTrickPlayerOrder: result.match.currentTrickPlayerOrder || [],
                creatorPlayerId: result.match.players[0]?.id,
                totalRounds: result.match.gameRounds?.length || 0,
                canSelectTrump: false,
                waitingForTrumpSelection: false,
                yourHand: []
            };
            
            setGameState(initialGameState);
            updateGameDisplay();
            showMessage(`Joined game! Waiting for other players.`);
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