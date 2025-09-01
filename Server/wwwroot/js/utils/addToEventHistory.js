function addToEventHistory(event) {
    if (!window.gameEventHistory) {
        window.gameEventHistory = [];
        // Add the welcome message as the first event if history is empty
        window.gameEventHistory.push(`${new Date().toLocaleTimeString()}: Welcome to Believe Or Not! Wait for other players to join.`);
    }
    
    // Check if the event already has a timestamp (format: "HH:MM:SS: message")
    let timestampedEvent;
    if (event.match(/^\d{1,2}:\d{2}:\d{2}:/)) {
        // Message already has timestamp from server
        timestampedEvent = event;
    } else {
        // Add timestamp to event
        timestampedEvent = `${new Date().toLocaleTimeString()}: ${event}`;
    }
    
    window.gameEventHistory.push(timestampedEvent);
    
    // Keep last 8 messages (doubled from 4)
    if (window.gameEventHistory.length > 8) {
        window.gameEventHistory.shift();
    }
    
    console.log("Event history updated:", window.gameEventHistory);
    showEventHistory();
}