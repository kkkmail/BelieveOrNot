// Server/wwwroot/king/js/core/initializeConnection.js
import { setConnection, setGameState } from "./variables.js";
import { updateConnectionStatus } from "../../../js/core/updateConnectionStatus.js";
import { updateGameDisplay } from "../display/updateGameDisplay.js";
import { addToEventHistory } from "../utils/addToEventHistory.js";
import { getOrCreatePlayerId } from "../../../js/utils/playerIdUtils.js";
import { setPlayerId } from "./variables.js";

export async function initializeConnection() {
    const persistentPlayerId = getOrCreatePlayerId();
    setPlayerId(persistentPlayerId);
    console.log("King: Using player ID:", persistentPlayerId);

    const s = globalThis.signalR || window.signalR;
    if (!s) { throw new Error("SignalR script not loaded (include it as a classic <script> before modules)."); }

    const hub = new s.HubConnectionBuilder()
        .withUrl("/kingHub")
        .withAutomaticReconnect()
        .build();

    setConnection(hub);

    hub.on("StateUpdate", (state) => {
        console.log("=== KING STATE UPDATE RECEIVED ===", state);
        setGameState(state);
        // Update display when state changes
        updateGameDisplay();
    });

    // Handle game events (for message broadcasting)
    hub.on("GameEvent", (gameEvent) => {
        console.log("=== KING GAME EVENT RECEIVED ===", gameEvent);
        addToEventHistory(gameEvent);
    });

    // Handle connection events
    hub.onreconnecting((error) => {
        console.log("King Hub: Connection lost, attempting to reconnect...", error);
        updateConnectionStatus("disconnected");
    });

    hub.onreconnected((connectionId) => {
        console.log("King Hub: Connection restored!", connectionId);
        updateConnectionStatus("connected");
    });

    hub.onclose((error) => {
        console.log("King Hub: Connection closed", error);
        updateConnectionStatus("disconnected");
    });

    try {
        await hub.start();
        console.log("King Hub: Connected successfully!");
        updateConnectionStatus("connected");
    } catch (err) {
        console.error("King Hub: Connection failed:", err);
        updateConnectionStatus("disconnected");
        throw err;
    }

    return hub;
}
