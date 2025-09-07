// js/initialization.js
// Initialize the application
import { loadHtmlContent } from "./utils/loadHtmlContent.js";
import { setupEventListeners } from "./utils/setupEventListeners.js";
import { setupGameBoardEventListeners } from "./utils/setupGameBoardEventListeners.js";
import { initializeConnection } from "./core/initializeConnection.js";
import { initCustomAlert } from "./utils/initCustomAlert.js";
import { initCustomConfirm } from "./utils/initCustomConfirm.js";
import { initializeSetupForm } from "./utils/initializeSetupForm.js";
import { updateActionsDisplay } from "./display/updateActionsDisplay.js";
import { getGameTypeFromUrl } from "./utils/gameRouter.js";

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM loaded, starting initialization...");

    // Check if this is a King game request
    const gameType = getGameTypeFromUrl();
    if (gameType === 'king') {
        console.log("King game detected, redirecting to King main page...");
        // Redirect to the dedicated King game page
        window.location.href = '/king/king.html' + window.location.search;
        return;
    }

    // Initialize BelieveOrNot game (default)
    await initializeBelieveOrNotGame();
});

async function initializeBelieveOrNotGame() {
    console.log("Initializing BelieveOrNot game...");

    // Initialize custom dialogs
    initCustomAlert();
    initCustomConfirm();

    // Load HTML content
    await loadHtmlContent();

    // Initialize setup form
    initializeSetupForm();

    // Set up event listeners
    setupEventListeners();
    setupGameBoardEventListeners();

    // Update display
    updateActionsDisplay();

    // Initialize connection
    await initializeConnection();

    console.log("BelieveOrNot game initialized successfully");
}