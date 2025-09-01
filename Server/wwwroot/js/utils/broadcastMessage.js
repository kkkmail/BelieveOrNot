// Broadcast a message to all players in the current match
async function broadcastMessage(message) {
    if (!connection || !gameState || !gameState.matchId) {
        console.error("Cannot broadcast message: connection or match not available");
        return false;
    }

    try {
        await connection.invoke("BroadcastMessage", gameState.matchId, message);
        console.log("Message broadcasted successfully:", message);
        return true;
    } catch (err) {
        console.error("Failed to broadcast message:", err);
        return false;
    }
}

// Test function that broadcasts to all players
function testBroadcastMessage() {
    console.log("=== TESTING BROADCAST MESSAGE SYSTEM ===");
    
    if (!gameState || !gameState.matchId) {
        console.error("Not in a game - cannot test broadcast");
        alert("Join or create a game first to test broadcasting");
        return;
    }
    
    // Test broadcasting multiple messages
    broadcastMessage("🧪 Test message 1 - This should appear for ALL players!");
    
    setTimeout(() => {
        broadcastMessage("🧪 Test message 2 - Broadcasting works!");
    }, 1000);
    
    setTimeout(() => {
        broadcastMessage("🧪 Test message 3 - All players should see this!");
    }, 2000);
    
    console.log("Test broadcast messages sent. All players should see them.");
}