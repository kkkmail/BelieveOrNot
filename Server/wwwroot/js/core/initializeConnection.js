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
        
        // If there's a LastAction, show it as a game event
        if (state.LastAction && state.LastAction.trim() !== '') {
            console.log("Processing LastAction:", state.LastAction);
            
            // Test the message system directly
            const messageArea = document.getElementById('messageArea');
            console.log("Message area element:", messageArea);
            
            if (messageArea) {
                console.log("Current message area content before update:", messageArea.innerHTML);
            }
            
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
            
            console.log("Processed event message:", eventMessage);
            console.log("About to call showMessage...");
            
            // Call showMessage and see what happens
            showMessage(eventMessage, 0, true);
            
            console.log("showMessage called");
            
            // Check message area after update
            if (messageArea) {
                console.log("Message area content after showMessage:", messageArea.innerHTML);
            }
            
            // Also check the event history
            console.log("Current event history:", window.gameEventHistory);
        } else {
            console.log("No LastAction in state update");
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