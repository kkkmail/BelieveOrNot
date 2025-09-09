// js/utils/setupEventListeners.js
import {setupFormButtons} from "./setupFormButtons.js";

export function setupEventListeners() {
    console.log("Setting up event listeners...");

    // Setup form buttons (these exist immediately)
    setupFormButtons();

    console.log("Initial event listeners set up");
}
