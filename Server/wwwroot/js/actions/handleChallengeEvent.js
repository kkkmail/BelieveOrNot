// js/actions/handleChallengeEvent.js
import {animateChallengeCardFlip} from "../utils/animateChallengeCardFlip.js";
import {setSelectedChallengeIndex} from "../core/variables.js";
import {gameState, playerId} from "../core/variables.js";
import {clearPendingChallengeAnimation} from "./clearPendingChallengeAnimation.js";
import {updatePreviousPlayDisplay} from "../display/updatePreviousPlayDisplay.js";
import {updateActionsDisplay} from "../display/updateActionsDisplay.js";

// Function to be called when challenge event is received from server
export async function handleChallengeEvent(challengeEventData) {
    console.log("=== HANDLE CHALLENGE EVENT ===");
    
    const pendingAnimation = window.pendingChallengeAnimation;
    console.log("pendingChallengeAnimation:", pendingAnimation);
    console.log("challengeEventData:", challengeEventData);

    if (!pendingAnimation) {
        console.log("❌ No pending challenge animation");
        return;
    }

    if (!challengeEventData) {
        console.error("❌ No challenge event data provided");
        clearPendingChallengeAnimation();
        setSelectedChallengeIndex(-1);
        updatePreviousPlayDisplay();
        updateActionsDisplay();
        return;
    }

    console.log("✅ Processing challenge event with structured data");

    const { tableCardElement, cardIndex, announcedRank } = pendingAnimation;
    
    // Handle both camelCase and PascalCase property names
    const revealedCard = challengeEventData.revealedCard || challengeEventData.RevealedCard;
    const isMatch = challengeEventData.isMatch !== undefined ? challengeEventData.isMatch : challengeEventData.IsMatch;
    const challengerName = challengeEventData.challengerName || challengeEventData.ChallengerName;
    const remainingCards = challengeEventData.remainingCards || challengeEventData.RemainingCards;
    const remainingCardsMatch = challengeEventData.remainingCardsMatch || challengeEventData.RemainingCardsMatch;

    console.log("Extracted challenge data:", { revealedCard, isMatch, challengerName, remainingCards, remainingCardsMatch, announcedRank });

    if (!revealedCard) {
        console.error("❌ No revealed card in challenge event data");
        clearPendingChallengeAnimation();
        setSelectedChallengeIndex(-1);
        updatePreviousPlayDisplay();
        updateActionsDisplay();
        return;
    }

    // Check if current player is the challenger
    const currentPlayer = gameState?.players?.find(p => p.id === playerId);
    const isChallenger = currentPlayer?.name === challengerName;

    console.log("Challenger check:", { currentPlayerName: currentPlayer?.name, challengerName, isChallenger });

    // Animate both elements if they exist (same as original logic)
    const animationPromises = [];

    if (tableCardElement) {
        console.log("🎬 Animating table card element");
        animationPromises.push(
            animateChallengeCardFlip(tableCardElement, revealedCard, announcedRank, isMatch, isChallenger, remainingCards, remainingCardsMatch, cardIndex)
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

    // DELAY clearing selection and updating display (like original challenge area)
    setTimeout(() => {
        console.log("🧹 Clearing selection after animation completed + wait time");
        setSelectedChallengeIndex(-1);
        clearPendingChallengeAnimation();
        updatePreviousPlayDisplay();
        updateActionsDisplay();
    }, 200); // Small delay like original to ensure animation cleanup is complete
}