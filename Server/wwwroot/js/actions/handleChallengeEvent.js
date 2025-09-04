// js/actions/handleChallengeEvent.js
import {animateChallengeCardFlip} from "../utils/animateChallengeCardFlip.js";
import {hideChallenge} from "./hideChallenge.js";
import {setSelectedChallengeIndex} from "../core/variables.js";
import {gameState, playerId} from "../core/variables.js";

let pendingChallengeAnimation = null;

export function setPendingChallengeAnimation(animationInfo) {
    pendingChallengeAnimation = animationInfo;
    console.log("✅ Pending challenge animation set up:", pendingChallengeAnimation);
}

export function clearPendingChallengeAnimation() {
    pendingChallengeAnimation = null;
    console.log("🧹 Cleared pending challenge animation");
}

export function hasPendingChallengeAnimation() {
    return pendingChallengeAnimation !== null;
}

// Function to be called when challenge event is received from server
export async function handleChallengeEvent(challengeEventData) {
    console.log("=== HANDLE CHALLENGE EVENT ===");
    console.log("pendingChallengeAnimation:", pendingChallengeAnimation);
    console.log("challengeEventData:", challengeEventData);

    if (!pendingChallengeAnimation) {
        console.log("❌ No pending challenge animation");
        return;
    }

    if (!challengeEventData) {
        console.error("❌ No challenge event data provided");
        clearPendingChallengeAnimation();
        hideChallenge();
        setSelectedChallengeIndex(-1);
        return;
    }

    console.log("✅ Processing challenge event with structured data");

    const { challengeCardElement, tableCardElement, cardIndex, announcedRank } = pendingChallengeAnimation;
    
    // Handle both camelCase and PascalCase property names
    const revealedCard = challengeEventData.revealedCard || challengeEventData.RevealedCard;
    const isMatch = challengeEventData.isMatch !== undefined ? challengeEventData.isMatch : challengeEventData.IsMatch;
    const challengerName = challengeEventData.challengerName || challengeEventData.ChallengerName;
    const remainingCards = challengeEventData.remainingCards || challengeEventData.RemainingCards;

    console.log("Extracted challenge data:", { revealedCard, isMatch, challengerName, remainingCards, announcedRank });

    if (!revealedCard) {
        console.error("❌ No revealed card in challenge event data");
        clearPendingChallengeAnimation();
        hideChallenge();
        setSelectedChallengeIndex(-1);
        return;
    }

    // Check if current player is the challenger
    const currentPlayer = gameState?.players?.find(p => p.id === playerId);
    const isChallenger = currentPlayer?.name === challengerName;

    console.log("Challenger check:", { currentPlayerName: currentPlayer?.name, challengerName, isChallenger });

    // Animate both elements if they exist (challenge area and table area)
    const animationPromises = [];

    if (challengeCardElement) {
        console.log("🎬 Animating challenge card element");
        animationPromises.push(
            animateChallengeCardFlip(challengeCardElement, revealedCard, announcedRank, isMatch, isChallenger, remainingCards, cardIndex)
        );
    }

    if (tableCardElement) {
        console.log("🎬 Animating table card element");
        animationPromises.push(
            animateChallengeCardFlip(tableCardElement, revealedCard, announcedRank, isMatch, isChallenger, remainingCards, cardIndex)
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
    clearPendingChallengeAnimation();
}