// js/utils/showMessage.js
import {addToEventHistory} from "./addToEventHistory.js";
import {broadcastMessage} from "./broadcastMessage.js";
import {connection, gameState} from "../core/variables.js";

export function showMessage(message, duration = 0, isGameEvent = true, shouldBroadcast = false) {
    console.log("showMessage called:", {message, duration, isGameEvent, shouldBroadcast});

    // If shouldBroadcast is true, send to all players instead of just local
    if (shouldBroadcast && connection && gameState && gameState.matchId) {
        console.log("Broadcasting message to all players:", message);
        broadcastMessage(message);
        return; // Don't show locally since broadcast will echo back
    }

    // All messages are treated as game events (persistent)
    // Message is already HTML formatted if it came from server
    console.log("Adding message to persistent history:", message);
    addToEventHistory(message);
}