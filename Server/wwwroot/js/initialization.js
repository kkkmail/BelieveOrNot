// js/initialization.js
// Initialize the application
import {loadHtmlContent} from "./utils/loadHtmlContent.js";
import {setupEventListeners} from "./utils/setupEventListeners.js";
import {setupGameBoardEventListeners} from "./utils/setupGameBoardEventListeners.js";
import {initializeConnection} from "./core/initializeConnection.js";
import {initCustomAlert} from "./utils/initCustomAlert.js";
import {initCustomConfirm} from "./utils/initCustomConfirm.js";
import {initializeSetupForm} from "./utils/initializeSetupForm.js";
import {updateActionsDisplay} from "./display/updateActionsDisplay.js";

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM loaded, starting initialization...");

    // Initialize custom alert to replace ugly system alerts
    initCustomAlert();

    // Initialize custom confirm to replace ugly system confirms
    initCustomConfirm();

    // First load the HTML content
    await loadHtmlContent();

    // Initialize setup form (pre-fill match ID from URL if present)
    initializeSetupForm();

    // Set up initial event listeners (setup form)
    setupEventListeners();

    // Set up game board event listeners after HTML is loaded
    setupGameBoardEventListeners();

    // IMPORTANT: Call updateActionsDisplay to show "Other Games" button on home page
    updateActionsDisplay();

    // Then initialize the connection (this will attempt reconnection if needed)
    await initializeConnection();

    console.log("Application initialized successfully");
});