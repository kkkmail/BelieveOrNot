function addToEventHistory(event) {
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
        
        // FIXED: Apply message formatting enhancements
        let enhancedMessage = message;
        
        // Apply challenge message formatting
        if (message.includes('challenges') || message.includes('Challenged card was')) {
            enhancedMessage = formatChallengeMessage(message);
        }
        
        // Apply disposal message formatting
        if (message.includes('disposed 4 of a kind')) {
            enhancedMessage = formatDisposalMessage(message);
        }
        
        timestampedEvent = `${timestamp}: ${enhancedMessage}`;
    } else {
        // Add timestamp to event using consistent formatting
        let enhancedEvent = event;
        
        // Apply message formatting enhancements
        if (event.includes('challenges') || event.includes('Challenged card was')) {
            enhancedEvent = formatChallengeMessage(event);
        }
        
        if (event.includes('disposed 4 of a kind')) {
            enhancedEvent = formatDisposalMessage(event);
        }
        
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