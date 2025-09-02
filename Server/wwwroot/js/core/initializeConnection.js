import { setConnection, setGameState } from "./variables.js";
import { updateConnectionStatus } from "./updateConnectionStatus.js";
import { updateGameDisplay } from "../display/updateGameDisplay.js";
import { addToEventHistory } from "../utils/addToEventHistory.js";

export async function initializeConnection() {
    const serverUrl = "http://localhost:5000/game";

    const s = globalThis.signalR || window.signalR;
    if (!s) { throw new Error("SignalR script not loaded (include it as a classic <script> before modules)."); }

    const hub = new s.HubConnectionBuilder()
        .withUrl(serverUrl)
        .withAutomaticReconnect()
        .build();

    setConnection(hub);

    hub.on("StateUpdate", (state, clientCmdIdEcho) => {
        console.log("=== STATE UPDATE RECEIVED ===", state);
        setGameState(state);
        updateGameDisplay();
    });

    hub.on("MessageBroadcast", (message, senderName) => {
        console.log("=== MESSAGE BROADCAST RECEIVED ===", message, senderName);
        addToEventHistory(message);
    });

    try {
        await hub.start();
        updateConnectionStatus("connected");
        console.log("SignalR Connected");
    } catch (err) {
        console.error("Connection failed:", err);
        updateConnectionStatus("disconnected");
    }
}
