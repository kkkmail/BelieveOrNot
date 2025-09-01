function showMessage(message, duration = 0, isGameEvent = true) {
    console.log("showMessage called:", {message, duration, isGameEvent});
    
    // ALL messages are now treated as game events (persistent)
    // No more temporary disappearing messages
    console.log("Adding message to persistent history:", message);
    addToEventHistory(message);
}