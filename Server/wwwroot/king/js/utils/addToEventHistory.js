// Server/wwwroot/king/js/utils/addToEventHistory.js
import { getCurrentTime } from "../../../js/utils/getCurrentTime.js";
import { showEventHistory } from "./showEventHistory.js";

export async function addToEventHistory(event) {
    console.log("=== KING ADD TO EVENT HISTORY ===");
    console.log("Event received:", event);
    
    if (!window.gameEventHistory) {
        window.gameEventHistory = [];
        // Add the welcome message as the first event if history is empty
        window.gameEventHistory.push(`${getCurrentTime()}: Welcome to The King! Wait for 3 more players to join.`);
    }

    let timestampedEvent;

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
            new Date(eventTimestamp).toLocaleTimeString() : 
            getCurrentTime();
            
        timestampedEvent = `${timestamp}: ${displayMessage}`;
        
        console.log("Structured event formatted:", timestampedEvent);
    } else {
        // Handle string events (legacy or manual)
        const eventString = typeof event === 'string' ? event : String(event);
        
        // Check if event already has a timestamp
        if (eventString.match(/^\d{1,2}:\d{2}:\d{2}(\s?(AM|PM))?:/)) {
            timestampedEvent = eventString;
        } else {
            timestampedEvent = `${getCurrentTime()}: ${eventString}`;
        }
        
        console.log("String event formatted:", timestampedEvent);
    }

    // Add to history
    window.gameEventHistory.push(timestampedEvent);
    
    // Keep only last 50 events to prevent memory issues
    if (window.gameEventHistory.length > 50) {
        window.gameEventHistory = window.gameEventHistory.slice(-50);
    }

    // Update the display
    showEventHistory();
    
    console.log("Event added to history. Total events:", window.gameEventHistory.length);
}