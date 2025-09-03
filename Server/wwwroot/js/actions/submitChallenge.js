// js/actions/submitChallenge.js
import {connection, gameState, playerId, selectedChallengeIndex, setSelectedChallengeIndex} from "../core/variables.js";
import {hideChallenge} from "./hideChallenge.js";
import {generateGuid} from "../utils/generateGuid.js";
import {customConfirm} from "../utils/customConfirm.js";

export async function submitChallenge() {
    console.log("submitChallenge called, selectedChallengeIndex:", selectedChallengeIndex);

    if (selectedChallengeIndex === -1) {
        alert('Please select a card to flip');
        return;
    }

    // Get challenge details for confirmation dialog
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

    // Format player name and rank with proper HTML styling for confirmation dialog
    const formattedPlayerName = `<span style="font-weight: bold; font-style: italic;">${targetPlayer?.name || 'the previous player'}</span>`;
    const formattedRank = `<span style="font-weight: bold; font-size: 1.3em;">${gameState.announcedRank}</span>`;
    const formattedCardNumber = `<span style="font-weight: bold;">${selectedChallengeIndex + 1}</span>`;

    // Show confirmation dialog with HTML formatting
    const confirmed = await customConfirm(
        `Are you sure you want to challenge ${formattedPlayerName}?\n\n` +
        `You are challenging that card ${formattedCardNumber} is NOT a ${formattedRank}.`,
        'Challenge Player'
    );

    if (!confirmed) {
        console.log("Challenge cancelled by user");
        return; // User cancelled, don't send challenge
    }

    console.log("User confirmed challenge, sending to server...");

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