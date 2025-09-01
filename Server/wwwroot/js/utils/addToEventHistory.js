function addToEventHistory(event) {
    if (!window.gameEventHistory) {
        window.gameEventHistory = [];
        // Add the welcome message as the first event if history is empty
        window.gameEventHistory.push(`${new Date().toLocaleTimeString()}: Welcome to Believe Or Not! Wait for other players to join.`);
    }
    
    // Add timestamp to event
    const timestampedEvent = `${new Date().toLocaleTimeString()}: ${event}`;
    window.gameEventHistory.push(timestampedEvent);
    
    // INCREASED: Keep last 8 messages (doubled from 4)
    if (window.gameEventHistory.length > 8) {
        window.gameEventHistory.shift();
    }
    
    console.log("Event history updated:", window.gameEventHistory);
    showEventHistory();
}