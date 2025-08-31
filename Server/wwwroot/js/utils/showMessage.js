function showMessage(message, duration = 5000, isGameEvent = false) {
    const messageArea = document.getElementById('messageArea');
    
    if (isGameEvent) {
        // Add to event history (keep last 4 events)
        addToEventHistory(message);
    } else {
        // Show temporary message
        messageArea.textContent = message;
        
        // Clear message after duration
        setTimeout(() => {
            if (messageArea.textContent === message) {
                showEventHistory(); // Show event history when temp message clears
            }
        }, duration);
    }
}