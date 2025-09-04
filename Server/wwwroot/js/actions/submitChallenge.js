// js/actions/submitChallenge.js
import {connection, gameState, playerId, selectedChallengeIndex, setSelectedChallengeIndex} from "../core/variables.js";
import {hideChallenge} from "./hideChallenge.js";
import {generateGuid} from "../utils/generateGuid.js";
import {customConfirm} from "../utils/customConfirm.js";
import {animateChallengeCardFlip} from "../utils/animateChallengeCardFlip.js";
import {extractChallengeInfo} from "../utils/extractChallengeInfo.js";

let pendingChallengeAnimation = null;

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

        // Store pending animation info to trigger when we get the result
        const challengeCardElement = document.querySelector(`.challenge-card-display:nth-child(${selectedChallengeIndex + 1})`);
        const tableCardElement = document.querySelector(`#previousPlayCards .card:nth-child(${selectedChallengeIndex + 1})`);
        
        console.log("Looking for animation elements:", {
            challengeSelector: `.challenge-card-display:nth-child(${selectedChallengeIndex + 1})`,
            tableSelector: `#previousPlayCards .card:nth-child(${selectedChallengeIndex + 1})`,
            challengeCardElement: !!challengeCardElement,
            tableCardElement: !!tableCardElement
        });
        
        if (challengeCardElement || tableCardElement) {
            pendingChallengeAnimation = {
                challengeCardElement,
                tableCardElement,
                cardIndex: selectedChallengeIndex,
                announcedRank: gameState.announcedRank
            };
            console.log("✅ Pending challenge animation set up");
        } else {
            console.warn("⚠️ No card elements found for animation");
        }

        await connection.invoke("SubmitMove", challengeRequest);

        console.log("Challenge submitted successfully - keeping challenge UI visible until animation completes");
        // DON'T hide challenge area yet - wait for animation to complete
    } catch (err) {
        console.error("Failed to challenge:", err);
        alert("Failed to challenge: " + err.message || err);
        pendingChallengeAnimation = null;
        // Hide challenge area on error
        hideChallenge();
        setSelectedChallengeIndex(-1);
    }
}

// Function to be called when challenge result message is received
export async function handleChallengeResult(challengeMessage) {
    console.log("=== HANDLE CHALLENGE RESULT ===");
    console.log("pendingChallengeAnimation:", pendingChallengeAnimation);
    console.log("challengeMessage:", challengeMessage);

    if (!pendingChallengeAnimation) {
        console.log("❌ No pending challenge animation");
        return;
    }

    console.log("Processing challenge result animation for message:", challengeMessage);

    const challengeInfo = extractChallengeInfo(challengeMessage);
    if (!challengeInfo) {
        console.error("❌ Could not extract challenge information");
        pendingChallengeAnimation = null;
        // Hide challenge area if we can't animate
        hideChallenge();
        setSelectedChallengeIndex(-1);
        return;
    }

    console.log("✅ Extracted challenge info:", challengeInfo);

    const { challengeCardElement, tableCardElement, cardIndex, announcedRank } = pendingChallengeAnimation;
    const { revealedCard, isMatch } = challengeInfo;

    // Animate both elements if they exist (challenge area and table area)
    const animationPromises = [];

    if (challengeCardElement) {
        console.log("🎬 Animating challenge card element");
        animationPromises.push(
            animateChallengeCardFlip(challengeCardElement, revealedCard, announcedRank, isMatch)
        );
    }

    if (tableCardElement) {
        console.log("🎬 Animating table card element");
        animationPromises.push(
            animateChallengeCardFlip(tableCardElement, revealedCard, announcedRank, isMatch)
        );
    }

    // Wait for all animations to complete
    if (animationPromises.length > 0) {
        console.log("⏳ Waiting for animations to complete...");
        await Promise.all(animationPromises);
        console.log("✅ All challenge card animations completed");
    } else {
        console.warn("⚠️ No animations to run");
    }

    // NOW hide challenge area after animation completes
    console.log("🧹 Hiding challenge area after animation completed");
    hideChallenge();
    setSelectedChallengeIndex(-1);

    // Clear pending animation
    pendingChallengeAnimation = null;
}