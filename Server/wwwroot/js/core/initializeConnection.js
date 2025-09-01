async function initializeConnection() {
    // Update this URL to match your server address
    const serverUrl = "http://localhost:5000/game"; // or https://localhost:5001/game

    connection = new signalR.HubConnectionBuilder()
        .withUrl(serverUrl)
        .withAutomaticReconnect()
        .build();

    connection.on("StateUpdate", (state, clientCmdIdEcho) => {
        console.log("Game state updated:", state);
        gameState = state;
        
        // If there's a LastAction, show it as a game event
        if (state.LastAction && state.LastAction.trim() !== '') {
            console.log("Broadcasting game event:", state.LastAction);
            
            // Parse and enhance event messages for better display
            let eventMessage = state.LastAction;
            
            // Add appropriate icons based on message content
            if (eventMessage.includes('joined the game')) {
                eventMessage = '👋 ' + eventMessage;
            } else if (eventMessage.includes('Round') && eventMessage.includes('started')) {
                eventMessage = '🎯 ' + eventMessage;
            } else if (eventMessage.includes('disposed 4 of a kind')) {
                eventMessage = '♠️♥️♦️♣️ ' + eventMessage;
            } else if (eventMessage.includes('challenges')) {
                eventMessage = '⚔️ ' + eventMessage;
            } else if (eventMessage.includes('Round') && eventMessage.includes('ended')) {
                eventMessage = '🏁 ' + eventMessage;
            } else if (eventMessage.includes('NO CARDS LEFT')) {
                eventMessage = '🎯 ' + eventMessage;
            }
            
            showMessage(eventMessage, 0, true); // Show as persistent game event
        }
        
        updateGameDisplay();
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