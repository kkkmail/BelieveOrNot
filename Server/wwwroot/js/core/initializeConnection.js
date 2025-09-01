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
            showMessage(state.LastAction, 0, true); // Show as game event
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