// Test function to verify message system works
function testMessageSystem() {
    console.log("=== TESTING MESSAGE SYSTEM ===");
    
    // Test showMessage directly
    console.log("Testing showMessage...");
    showMessage("Test message 1", 0, true);
    
    setTimeout(() => {
        showMessage("Test message 2", 0, true);
    }, 1000);
    
    setTimeout(() => {
        showMessage("Test message 3", 0, true);
    }, 2000);
    
    console.log("Test messages sent. Check message area.");
    console.log("Current event history:", window.gameEventHistory);
}

// Call this from browser console to test: testMessageSystem()