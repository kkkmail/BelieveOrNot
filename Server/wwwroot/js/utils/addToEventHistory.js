// js/utils/addToEventHistory.js
import {getCurrentTime} from "./getCurrentTime.js";
import {showEventHistory} from "./showEventHistory.js";
import {handleChallengeEvent} from "../actions/handleChallengeEvent.js";

export async function addToEventHistory(event) {
    console.log("=== ADD TO EVENT HISTORY ===");
    console.log("Event received:", event);
    
    if (!window.gameEventHistory) {
        window.gameEventHistory = [];
        // Add the welcome message as the first event if history is empty
        window.gameEventHistory.push(`${getCurrentTime()}: Welcome to Believe Or Not! Wait for other players to join.`);
    }

    let timestampedEvent;
    let shouldTriggerAnimation = false;

    // Handle different types of events
    if (typeof event === 'object' && (event.type || event.Type) && (event.displayMessage || event.DisplayMessage)) {
        // NEW: Structured event from server (handle both camelCase and PascalCase)
        const eventType = event.type || event.Type;
        const displayMessage = event.displayMessage || event.DisplayMessage;
        const eventData = event.data || event.Data;
        const eventTimestamp = event.timestamp || event.Timestamp;
        
        console.log("Processing structured event:", eventType);
        
        // Use server timestamp if available, otherwise add our own
        const timestamp = eventTimestamp ? 
            new Date(eventTimestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) :
            getCurrentTime();
        
        timestampedEvent = `${timestamp}: ${displayMessage}`;
        
        // Check if this is a challenge event that needs animation
        if (eventType === 'Challenge' && eventData) {
            console.log("🎯 DETECTED CHALLENGE EVENT - setting flag and triggering animation");
            shouldTriggerAnimation = true;
            
            // Set flag to prevent card clearing during animation
            window.challengeEventPending = true;
        }
    } else if (typeof event === 'string') {
        // OLD: Legacy string message (for backward compatibility)
        if (event.match(/^\d{1,2}:\d{2}:\d{2}:/)) {
            timestampedEvent = event;
        } else {
            timestampedEvent = `${getCurrentTime()}: ${event}`;
        }
        
        // Legacy challenge detection (fallback)
        if (event.includes('challenges') && event.includes('Challenged card was')) {
            console.log("🎯 DETECTED LEGACY CHALLENGE MESSAGE");
            // We'll need to parse this for backward compatibility, but ideally this shouldn't happen
        }
    } else {
        console.error("Unknown event format:", event);
        return;
    }

    if (shouldTriggerAnimation) {
        // Trigger animation immediately
        console.log("Calling handleChallengeEvent...");
        const eventData = event.data || event.Data;
        await handleChallengeEvent(eventData);
        console.log("handleChallengeEvent completed");
        
        // Clear the flag after animation
        window.challengeEventPending = false;
        
        // Add to history after animation
        window.gameEventHistory.push(timestampedEvent);

        // Keep last 8 messages
        if (window.gameEventHistory.length > 8) {
            window.gameEventHistory.shift();
        }

        console.log("Event history updated (after animation):", window.gameEventHistory.length, "messages");
        showEventHistory();
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