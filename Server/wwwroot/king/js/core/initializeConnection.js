// Server/wwwroot/king/js/core/initializeConnection.js
import { setConnection, setGameState, setClientId } from "./variables.js";
import { updateConnectionStatus } from "./updateConnectionStatus.js";
import { updateGameDisplay } from "../display/updateGameDisplay.js";
import { getOrCreateClientId } from "../../../js/utils/clientIdUtils.js";
import { handleDisconnection, handleReconnection } from "../utils/reconnectionHandler.js";

export async function initializeConnection() {
    // Get or create persistent client ID
    const persistentClientId = getOrCreateClientId();
    setClientId(persistentClientId);
    console.log("King game using client ID:", persistentClientId);

    const s = globalThis.signalR || window.signalR;
    if (!s) { 
        throw new Error("SignalR script not loaded (include it as a classic <script> before modules)."); 
    }

    const hub = new s.HubConnectionBuilder()
        .withUrl("/kingHub")
        .withAutomaticReconnect()
        .build();

    setConnection(hub);

    hub.on("StateUpdate", (state) => {
        console.log("=== KING STATE UPDATE RECEIVED ===", state);
        setGameState(state);
        updateGameDisplay();
    });

    // Handle connection events
    hub.onreconnecting((error) => {
        console.log("King connection lost, attempting to reconnect...", error);
        updateConnectionStatus("disconnected");
        handleDisconnection();
    });

    hub.onreconnected((connectionId) => {
        console.log("King connection restored!", connectionId);
        updateConnectionStatus("connected");
        handleReconnection();
    });

    hub.onclose((error) => {
        console.log("King connection closed", error);
        updateConnectionStatus("disconnected");
        handleDisconnection();
    });

    try {
        await hub.start();
        updateConnectionStatus("connected");
        console.log("King SignalR Connected");

        // NO automatic reconnection attempt for King
        // Users should explicitly use Join button even with match ID in URL
        console.log("King connection ready - use Join button to join a game");
        
    } catch (err) {
        console.error("King connection failed:", err);
        updateConnectionStatus("disconnected");
    }
}