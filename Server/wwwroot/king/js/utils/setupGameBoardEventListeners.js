// js/utils/setupGameBoardEventListeners.js
import { setupGameButtons } from "./setupGameButtons.js";

export function setupGameBoardEventListeners() {
    console.log("Setting up King game board event listeners...");

    // Wait a bit for DOM to be ready
    setTimeout(() => {
        setupGameButtons();
    }, 100);
}