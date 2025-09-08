// Server/wwwroot/king/js/display/updateMessageArea.js
import { gameState } from "../core/variables.js";
import { showEventHistory } from "../utils/showEventHistory.js";

export function updateMessageArea() {
    // Don't replace messages - just ensure event history is shown
    // This prevents "Game in progress..." from overriding real messages
    showEventHistory();
    
    console.log("Message area updated - preserving event history");
}