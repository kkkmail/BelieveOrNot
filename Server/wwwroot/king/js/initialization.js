// Server/wwwroot/king/js/initialization.js
import { loadHtmlContent } from "./utils/loadHtmlContent.js";
import { setupEventListeners } from "./utils/setupEventListeners.js";
import { initializeConnection } from "./core/initializeConnection.js";
import { initCustomAlert } from "../../js/utils/initCustomAlert.js";
import { initCustomConfirm } from "../../js/utils/initCustomConfirm.js";
import { initializeSetupForm } from "./utils/initializeSetupForm.js";
import { updateGameDisplay } from "./display/updateGameDisplay.js";

document.addEventListener('DOMContentLoaded', async () => {
    console.log("King game DOM loaded, starting initialization...");

    // Initialize custom dialogs
    initCustomAlert();
    initCustomConfirm();

    // Load HTML content
    await loadHtmlContent();

    // Initialize setup form (pre-fill match ID from URL if present)
    initializeSetupForm();

    // Set up event listeners
    setupEventListeners();

    // Update display to show initial state
    updateGameDisplay();

    // Initialize connection (this will attempt reconnection if needed)
    await initializeConnection();

    console.log("King game initialized successfully");
});