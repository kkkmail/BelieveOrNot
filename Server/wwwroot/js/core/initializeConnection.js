async function initializeConnection() {
    const serverUrl = "http://localhost:5000/game";

    connection = new signalR.HubConnectionBuilder()
        .withUrl(serverUrl)
        .withAutomaticReconnect()
        .build();

    connection.on("StateUpdate", (state, clientCmdIdEcho) => {
        console.log("=== STATE UPDATE RECEIVED ===");
        console.log("Full state:", state);
        console.log("LastAction:", state.LastAction);
        console.log("===========================");
        
        gameState = state;
        
        // REMOVED: No longer processing LastAction here since messages are now broadcasted separately
        // The LastAction processing has been moved to MessageBroadcast handler
        
        updateGameDisplay();
    });

    // Listen for message broadcasts from server (these are the real game messages)
    connection.on("MessageBroadcast", (message, senderName) => {
        console.log("=== MESSAGE BROADCAST RECEIVED ===");
        console.log("Message:", message);
        console.log("Sender:", senderName);
        console.log("================================");
        
        // Add the message to local history and display
        // The message is already timestamped from the server
        addToEventHistory(message);
    });

    try {
        await connection.start();
        updateConnectionStatus("connected");
        console.log("SignalR Connected");
    } catch (err) {
        console.error("Connection failed:", err);
        updateConnectionStatus("disconnected");
    }
}