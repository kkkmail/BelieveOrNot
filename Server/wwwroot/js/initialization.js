// Server/wwwroot/js/initialization.js
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
        console.log("King game detected, loading King game on main page...");
        // Load King game on the same page - no redirection needed
        await initializeKingGame();
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

async function initializeKingGame() {
    console.log("Initializing King game on main page...");

    // Initialize custom dialogs
    initCustomAlert();
    initCustomConfirm();

    // Update page title and header for King game
    document.title = "The King - Russian Card Game";
    const header = document.querySelector('.game-header h1');
    const subtitle = document.querySelector('.game-header p');
    if (header) header.textContent = "👑 The King";
    if (subtitle) subtitle.textContent = "Russian Card Game";

    // Load King CSS files
    await loadKingStyles();

    // Load King HTML content
    const { loadHtmlContent } = await import("../king/js/utils/loadHtmlContent.js");
    await loadHtmlContent();

    // Initialize King setup form
    const { initializeSetupForm } = await import("../king/js/utils/initializeSetupForm.js");
    initializeSetupForm();

    // Set up King event listeners
    const { setupEventListeners } = await import("../king/js/utils/setupEventListeners.js");
    setupEventListeners();

    // Update King display
    const { updateGameDisplay } = await import("../king/js/display/updateGameDisplay.js");
    updateGameDisplay();

    // Initialize King connection
    const { initializeConnection } = await import("../king/js/core/initializeConnection.js");
    await initializeConnection();

    // Handle King reconnection if match ID in URL
    const { getMatchIdFromUrl } = await import("./utils/urlManager.js");
    const { attemptReconnection } = await import("../king/js/utils/reconnectionHandler.js");
    const matchIdFromUrl = getMatchIdFromUrl();
    if (matchIdFromUrl) {
        console.log("King match ID found in URL, attempting reconnection:", matchIdFromUrl);
        await attemptReconnection(matchIdFromUrl);
    }

    console.log("King game initialized successfully on main page");
}

function loadKingStyles() {
    return new Promise((resolve) => {
        const kingStyles = [
            '/king/styles/king-main.css',
            '/king/styles/king-table.css',
            '/king/styles/king-responsive.css',
            '/king/styles/trump-modal.css'
        ];

        let loadedCount = 0;
        const totalStyles = kingStyles.length;

        kingStyles.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => {
                loadedCount++;
                if (loadedCount === totalStyles) {
                    console.log('King CSS loaded successfully');
                    resolve();
                }
            };
            link.onerror = () => {
                console.warn(`Failed to load King CSS: ${href}`);
                loadedCount++;
                if (loadedCount === totalStyles) {
                    resolve();
                }
            };
            document.head.appendChild(link);
        });
    });
}
