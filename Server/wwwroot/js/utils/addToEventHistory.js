import {formatGameMessage} from "./formatGameMessage.js";
import {getCurrentTime} from "./getCurrentTime.js";
import {showEventHistory} from "./showEventHistory.js";

export function addToEventHistory(event) {
    if (!window.gameEventHistory) {
        window.gameEventHistory = [];
        // Add the welcome message as the first event if history is empty
        window.gameEventHistory.push(`${getCurrentTime()}: Welcome to Believe Or Not! Wait for other players to join.`);
    }

    // Check if the event already has a timestamp (format: "HH:MM:SS: message")
    let timestampedEvent;
    if (event.match(/^\d{1,2}:\d{2}:\d{2}:/)) {
        // Message already has timestamp from server - enhance the message content
        const parts = event.split(': ');
        const timestamp = parts[0];
        const message = parts.slice(1).join(': ');

        // FIXED: Apply comprehensive message formatting
        const enhancedMessage = formatGameMessage(message);

        timestampedEvent = `${timestamp}: ${enhancedMessage}`;
    } else {
        // Add timestamp to event using consistent formatting
        const enhancedEvent = formatGameMessage(event);
        timestampedEvent = `${getCurrentTime()}: ${enhancedEvent}`;
    }

    window.gameEventHistory.push(timestampedEvent);

    // Keep last 8 messages
    if (window.gameEventHistory.length > 8) {
        window.gameEventHistory.shift();
    }

    console.log("Event history updated:", window.gameEventHistory);
    showEventHistory();
}
