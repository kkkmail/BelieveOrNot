// Server/wwwroot/king/js/utils/setupEventListeners.js
import { setupGameButtons } from "./setupGameButtons.js";
import { setupFormButtons } from "./setupFormButtons.js";

export function setupEventListeners() {
    console.log("Setting up King game event listeners...");

    // Setup form buttons (these exist immediately)
    setupFormButtons();

    // Setup game buttons (these are added after HTML is loaded)
    setTimeout(() => {
        setupGameButtons();
    }, 100);

    console.log("King game event listeners set up");
}