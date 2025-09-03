// Initialize the application
import {loadHtmlContent} from "./utils/loadHtmlContent.js";
import {setupEventListeners} from "./utils/setupEventListeners.js";
import {setupGameBoardEventListeners} from "./utils/setupGameBoardEventListeners.js";
import {initializeConnection} from "./core/initializeConnection.js";
import {initCustomAlert} from "./utils/initCustomAlert.js";

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM loaded, starting initialization...");

    // Initialize custom alert to replace ugly system alerts
    initCustomAlert();

    // First load the HTML content
    await loadHtmlContent();

    // Set up initial event listeners (setup form)
    setupEventListeners();

    // Set up game board event listeners after HTML is loaded
    setupGameBoardEventListeners();

    // Then initialize the connection
    await initializeConnection();

    console.log("Application initialized successfully");
});