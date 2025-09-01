function showMessage(message, duration = 0, isGameEvent = true, shouldBroadcast = false) {
    console.log("showMessage called:", {message, duration, isGameEvent, shouldBroadcast});
    
    // If shouldBroadcast is true, send to all players instead of just local
    if (shouldBroadcast && connection && gameState && gameState.matchId) {
        console.log("Broadcasting message to all players:", message);
        broadcastMessage(message);
        return; // Don't show locally since broadcast will echo back
    }
    
    // ALL messages are now treated as game events (persistent)
    // No more temporary disappearing messages
    console.log("Adding message to persistent history:", message);
    addToEventHistory(message);
}