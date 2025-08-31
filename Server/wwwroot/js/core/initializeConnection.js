// Initialize SignalR connection
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