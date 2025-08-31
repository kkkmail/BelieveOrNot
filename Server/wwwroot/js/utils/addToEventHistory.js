function addToEventHistory(event) {
    if (!window.gameEventHistory) {
        window.gameEventHistory = [];
    }
    
    // Add timestamp to event
    const timestampedEvent = `${new Date().toLocaleTimeString()}: ${event}`;
    window.gameEventHistory.push(timestampedEvent);
    
    // Keep only last 4 events
    if (window.gameEventHistory.length > 4) {
        window.gameEventHistory.shift();
    }
    
    showEventHistory();
}