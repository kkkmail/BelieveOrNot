import {connection, gameState, playerId, selectedChallengeIndex, setSelectedChallengeIndex} from "../core/variables.js";
import {hideChallenge} from "./hideChallenge.js";
import {generateGuid} from "../utils/generateGuid.js";

export async function submitChallenge() {
    console.log("submitChallenge called, selectedChallengeIndex:", selectedChallengeIndex);

    if (selectedChallengeIndex === -1) {
        alert('Please select a card to flip');
        return;
    }

    // Show confirmation dialog
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isMyTurn = currentPlayer && currentPlayer.id === playerId;
    const targetPlayer = isMyTurn
        ? gameState.players[(gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length]
        : currentPlayer;

    console.log("Challenge details:", {
        challenger: "me",
        targetPlayer: targetPlayer?.name,
        selectedIndex: selectedChallengeIndex,
        announcedRank: gameState.announcedRank
    });

    const confirmed = confirm(
        `Are you sure you want to challenge ${targetPlayer?.name || 'the previous player'}?\n` +
        `You are challenging that card ${selectedChallengeIndex + 1} is NOT a ${gameState.announcedRank}.`
    );

    if (!confirmed) {
        console.log("Challenge cancelled by user");
        return;
    }

    console.log("Sending challenge to server...");

    try {
        const challengeRequest = {
            matchId: gameState.matchId,
            clientCmdId: generateGuid(),
            playerId: playerId,
            action: 1, // Challenge
            challengePickIndex: selectedChallengeIndex
        };

        console.log("Challenge request:", challengeRequest);

        await connection.invoke("SubmitMove", challengeRequest);

        console.log("Challenge submitted successfully");
        hideChallenge();
        setSelectedChallengeIndex(-1);
    } catch (err) {
        console.error("Failed to challenge:", err);
        alert("Failed to challenge: " + err.message || err);
    }
}
