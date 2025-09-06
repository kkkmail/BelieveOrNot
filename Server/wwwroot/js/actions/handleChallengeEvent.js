// js/actions/handleChallengeEvent.js
import {animateChallengeCardFlip} from "../utils/animateChallengeCardFlip.js";
import {setSelectedChallengeIndex} from "../core/variables.js";
import {gameState, playerId} from "../core/variables.js";
import {clearPendingChallengeAnimation} from "./clearPendingChallengeAnimation.js";
import {updatePreviousPlayDisplay} from "../display/updatePreviousPlayDisplay.js";
import {updateActionsDisplay} from "../display/updateActionsDisplay.js";
import {CONFIG} from "../utils/config.js";

// Function to be called when challenge event is received from server
export async function handleChallengeEvent(challengeEventData) {
    console.log("=== HANDLE CHALLENGE EVENT ===");

    // Clear "You played in order..." message when challenge ends
    window.lastPlayedMessage = null;
    console.log("Cleared lastPlayedMessage due to challenge end");

    const pendingAnimation = window.pendingChallengeAnimation;
    console.log("pendingChallengeAnimation:", pendingAnimation);
    console.log("challengeEventData:", challengeEventData);

    if (!challengeEventData) {
        console.error("❌ No challenge event data provided");
        if (pendingAnimation) {
            clearPendingChallengeAnimation();
            setSelectedChallengeIndex(-1);
            updatePreviousPlayDisplay();
            updateActionsDisplay();
        }
        return;
    }

    // Handle both camelCase and PascalCase property names
    const revealedCard = challengeEventData.revealedCard || challengeEventData.RevealedCard;
    const isMatch = challengeEventData.isMatch !== undefined ? challengeEventData.isMatch : challengeEventData.IsMatch;
    const challengerName = challengeEventData.challengerName || challengeEventData.ChallengerName;
    const remainingCards = challengeEventData.remainingCards || challengeEventData.RemainingCards;
    const remainingCardsMatch = challengeEventData.remainingCardsMatch || challengeEventData.RemainingCardsMatch;
    const cardIndex = challengeEventData.cardIndex !== undefined ? challengeEventData.cardIndex : challengeEventData.CardIndex;
    const announcedRank = challengeEventData.announcedRank || challengeEventData.AnnouncedRank;

    console.log("Extracted challenge data:", { revealedCard, isMatch, challengerName, remainingCards, remainingCardsMatch, cardIndex, announcedRank });

    if (!revealedCard) {
        console.error("❌ No revealed card in challenge event data");
        if (pendingAnimation) {
            clearPendingChallengeAnimation();
            setSelectedChallengeIndex(-1);
            updatePreviousPlayDisplay();
            updateActionsDisplay();
        }
        return;
    }

    // Check if current player is the challenger
    const currentPlayer = gameState?.players?.find(p => p.id === playerId);
    const isChallenger = currentPlayer?.name === challengerName;

    console.log("Challenger check:", { currentPlayerName: currentPlayer?.name, challengerName, isChallenger });

    const animationPromises = [];

    if (pendingAnimation) {
        // Challenger case - use pending animation info
        console.log("✅ Processing challenger animation");
        const { tableCardElement } = pendingAnimation;

        if (tableCardElement) {
            console.log("🎬 Animating table card element for challenger");
            animationPromises.push(
                animateChallengeCardFlip(tableCardElement, revealedCard, announcedRank, isMatch, isChallenger, remainingCards, remainingCardsMatch, cardIndex)
            );
        }
    } else {
        // Non-challenger case - animate the challenged card in the existing display
        console.log("✅ Processing non-challenger animation");
        const previousPlayCards = document.getElementById('previousPlayCards');

        if (previousPlayCards && cardIndex !== undefined) {
            const challengedCardElement = previousPlayCards.children[cardIndex];

            if (challengedCardElement) {
                console.log("🎬 Animating challenged card for non-challenger at index:", cardIndex);
                animationPromises.push(
                    animateChallengeCardFlip(challengedCardElement, revealedCard, announcedRank, isMatch, false, null, null, cardIndex)
                );
            } else {
                console.warn("⚠️ Challenged card element not found at index:", cardIndex);
            }
        } else {
            console.warn("⚠️ Previous play cards container not found or card index missing");
        }
    }

    // Wait for all animations to complete
    if (animationPromises.length > 0) {
        console.log("⏳ Waiting for animations to complete...");
        await Promise.all(animationPromises);
        console.log("✅ All challenge card animations completed");
    } else {
        console.warn("⚠️ No animations to run");
    }

    // Use config constants for cleanup delay
    const cleanupDelay = isChallenger ? CONFIG.CHALLENGE_CLEANUP_DELAY_CHALLENGER : CONFIG.CHALLENGE_CLEANUP_DELAY_NON_CHALLENGER;

    setTimeout(() => {
        console.log("🧹 Clearing selection after animation completed + wait time");

        if (pendingAnimation) {
            clearPendingChallengeAnimation();
        }

        setSelectedChallengeIndex(-1);
        window.playerInteractionState = false; // Reset interaction state to allow blinking
        updatePreviousPlayDisplay();
        updateActionsDisplay();
    }, cleanupDelay);
}
