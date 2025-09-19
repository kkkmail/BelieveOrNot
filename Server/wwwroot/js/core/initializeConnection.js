// js/core/initializeConnection.js
import { setConnection, setGameState, setPlayerId } from "./variables.js";
import { updateConnectionStatus } from "./updateConnectionStatus.js";
import { updateGameDisplay } from "../display/updateGameDisplay.js";
import { addToEventHistory } from "../utils/addToEventHistory.js";
import { getOrCreatePlayerId } from "../utils/playerIdUtils.js";
import { attemptReconnection, handleDisconnection, handleReconnection } from "../utils/reconnectionHandler.js";
import { showFinalResults } from "../utils/showFinalResults.js";

export async function initializeConnection() {
    // Get or create persistent player ID
    const persistentPlayerId = getOrCreatePlayerId();
    setPlayerId(persistentPlayerId);
    console.log("Using player ID:", persistentPlayerId);

    const s = globalThis.signalR || window.signalR;
    if (!s) { throw new Error("SignalR script not loaded (include it as a classic <script> before modules)."); }

    const hub = new s.HubConnectionBuilder()
        .withUrl("/game")
        .withAutomaticReconnect()
        .build();

    setConnection(hub);

    hub.on("StateUpdate", (state, clientCmdIdEcho) => {
        console.log("=== STATE UPDATE RECEIVED ===", state);
        setGameState(state);
        // IMPORTANT: Update display when state changes
        updateGameDisplay();
    });

    // NEW: Handle structured game events
    hub.on("GameEvent", (gameEvent) => {
        console.log("=== GAME EVENT RECEIVED ===", gameEvent);
        addToEventHistory(gameEvent);
    });

    // LEGACY: Handle old message broadcasts (for backward compatibility)
    hub.on("MessageBroadcast", (message, senderName) => {
        console.log("=== LEGACY MESSAGE BROADCAST RECEIVED ===", message, senderName);
        addToEventHistory(message);
    });

    // Handle game end results
    hub.on("GameEnded", (results) => {
        console.log("=== GAME ENDED ===", results);
        showFinalResults(results);
    });

    // Handle connection events
    hub.onreconnecting((error) => {
        console.log("Connection lost, attempting to reconnect...", error);
        updateConnectionStatus("disconnected");
        handleDisconnection();
    });

    hub.onreconnected((connectionId) => {
        console.log("Connection restored!", connectionId);
        updateConnectionStatus("connected");
        handleReconnection();
    });

    hub.onclose((error) => {
        console.log("Connection closed", error);
        updateConnectionStatus("disconnected");
        handleDisconnection();
    });

    try {
        await hub.start();
        updateConnectionStatus("connected");
        console.log("SignalR Connected");

        // Attempt reconnection if match ID is in URL
        const reconnected = await attemptReconnection();
        if (!reconnected) {
            console.log("No reconnection needed or failed, showing setup form");
        }
    } catch (err) {
        console.error("Connection failed:", err);
        updateConnectionStatus("disconnected");
    }
}
