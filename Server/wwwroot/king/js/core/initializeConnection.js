// js/core/initializeConnection.js
import { setConnection, setGameState, setClientId } from "./variables.js";
import { updateConnectionStatus } from "./updateConnectionStatus.js";
import { updateGameDisplay } from "../display/updateGameDisplay.js";
import { showMessage } from "../../../js/utils/showMessage.js"; // Reuse from BelieveOrNot
import { getOrCreateClientId } from "../../../js/utils/clientIdUtils.js"; // Reuse from BelieveOrNot
import { attemptReconnection } from "../utils/reconnectionHandler.js";

export async function initializeConnection() {
    // Get or create persistent client ID using BelieveOrNot's logic
    const persistentClientId = getOrCreateClientId();
    setClientId(persistentClientId);
    console.log("Using client ID:", persistentClientId);

    const s = globalThis.signalR || window.signalR;
    if (!s) { 
        throw new Error("SignalR script not loaded"); 
    }

    const hub = new s.HubConnectionBuilder()
        .withUrl("/kinghub")
        .withAutomaticReconnect()
        .build();

    setConnection(hub);

    hub.on("StateUpdate", (state) => {
        console.log("=== STATE UPDATE RECEIVED ===", state);
        setGameState(state);
        updateGameDisplay();
    });

    hub.on("GameEvent", (gameEvent) => {
        console.log("=== GAME EVENT RECEIVED ===", gameEvent);
        showMessage(gameEvent.displayMessage || gameEvent.DisplayMessage, 0, true, false);
    });

    hub.onreconnecting((error) => {
        console.log("Connection lost, attempting to reconnect...", error);
        updateConnectionStatus("disconnected");
    });

    hub.onreconnected((connectionId) => {
        console.log("Connection restored!", connectionId);
        updateConnectionStatus("connected");
        attemptReconnection();
    });

    hub.onclose((error) => {
        console.log("Connection closed", error);
        updateConnectionStatus("disconnected");
    });

    try {
        await hub.start();
        updateConnectionStatus("connected");
        console.log("SignalR Connected to King hub");

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