// js/initialization.js
import { loadHtmlContent } from "./utils/loadHtmlContent.js";
import { setupEventListeners } from "./utils/setupEventListeners.js";
import { setupGameBoardEventListeners } from "./utils/setupGameBoardEventListeners.js";
import { initializeConnection } from "./core/initializeConnection.js";
import { initializeSetupForm } from "./utils/initializeSetupForm.js";
import { setupBackButton } from "./utils/setupBackButton.js";

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM loaded, starting King game initialization...");

    // First load the HTML content
    await loadHtmlContent();

    // Initialize setup form (pre-fill match ID from URL if present)
    initializeSetupForm();

    // Set up initial event listeners (setup form)
    setupEventListeners();

    // Set up game board event listeners after HTML is loaded
    setupGameBoardEventListeners();

    // Setup back button to return to main page
    setupBackButton();

    // Initialize the connection
    await initializeConnection();

    console.log("King game initialized successfully");
});