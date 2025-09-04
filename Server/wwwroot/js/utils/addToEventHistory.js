// js/utils/addToEventHistory.js
import {getCurrentTime} from "./getCurrentTime.js";
import {showEventHistory} from "./showEventHistory.js";
import {handleChallengeResult} from "../actions/submitChallenge.js";

export async function addToEventHistory(event) {
    console.log("=== ADD TO EVENT HISTORY ===");
    console.log("Raw event:", event);
    
    if (!window.gameEventHistory) {
        window.gameEventHistory = [];
        // Add the welcome message as the first event if history is empty
        window.gameEventHistory.push(`${getCurrentTime()}: Welcome to Believe Or Not! Wait for other players to join.`);
    }

    // Check if the event already has a timestamp (format: "HH:MM:SS: message")
    let timestampedEvent;
    if (event.match(/^\d{1,2}:\d{2}:\d{2}:/)) {
        // Message already has timestamp from server - use as-is (it's already HTML formatted)
        timestampedEvent = event;
    } else {
        // Add timestamp to event (event is already HTML formatted from server)
        timestampedEvent = `${getCurrentTime()}: ${event}`;
    }

    // Check if this is a challenge result message and trigger animation
    const isChallengeMessage = event.includes('challenges');
    const hasResultInfo = event.includes('Challenged card was');
    
    console.log("Challenge detection:", {
        isChallengeMessage,
        hasResultInfo,
        shouldAnimate: isChallengeMessage && hasResultInfo
    });

    if (isChallengeMessage && hasResultInfo) {
        console.log("🎯 DETECTED CHALLENGE RESULT MESSAGE - triggering animation");
        console.log("Full message for animation:", event);
        
        // Trigger animation before adding to history (with small delay to ensure UI is ready)
        setTimeout(async () => {
            console.log("Calling handleChallengeResult...");
            await handleChallengeResult(event);
            console.log("handleChallengeResult completed");
        }, 100);
        
        // Add a small delay before showing the message to let animation start
        setTimeout(() => {
            window.gameEventHistory.push(timestampedEvent);

            // Keep last 8 messages
            if (window.gameEventHistory.length > 8) {
                window.gameEventHistory.shift();
            }

            console.log("Event history updated (after animation):", window.gameEventHistory.length, "messages");
            showEventHistory();
        }, 200);
    } else {
        // Regular message processing
        console.log("Regular message processing");
        window.gameEventHistory.push(timestampedEvent);

        // Keep last 8 messages
        if (window.gameEventHistory.length > 8) {
            window.gameEventHistory.shift();
        }

        console.log("Event history updated:", window.gameEventHistory.length, "messages");
        showEventHistory();
    }
}