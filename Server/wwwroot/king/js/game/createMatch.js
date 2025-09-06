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