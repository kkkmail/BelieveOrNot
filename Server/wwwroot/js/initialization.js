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
        console.log("King game detected, loading King game content...");
        await initializeKingGame();
        return;
    }

    // Initialize BelieveOrNot game (default)
    await initializeBelieveOrNotGame();
});

async function initializeKingGame() {
    console.log("Initializing King game...");
    
    // Load King-specific CSS files
    loadKingStyles();
    
    // Update page title and header for King
    document.title = "The King - Russian Card Game";
    const header = document.querySelector('.game-header h1');
    if (header) {
        header.innerHTML = '👑 The King';
    }
    const subtitle = document.querySelector('.game-header p');
    if (subtitle) {
        subtitle.textContent = 'Traditional Russian Card Game';
    }

    // Initialize custom dialogs
    initCustomAlert();
    initCustomConfirm();

    // Load King HTML content
    const { loadHtmlContent: loadKingHtmlContent } = await import('../king/js/utils/loadHtmlContent.js');
    await loadKingHtmlContent();

    // Initialize King setup form
    const { initializeSetupForm: initializeKingSetupForm } = await import('../king/js/utils/initializeSetupForm.js');
    initializeKingSetupForm();

    // Set up King event listeners
    const { setupEventListeners: setupKingEventListeners } = await import('../king/js/utils/setupEventListeners.js');
    setupKingEventListeners();

    // Update King display
    const { updateGameDisplay: updateKingGameDisplay } = await import('../king/js/display/updateGameDisplay.js');
    updateKingGameDisplay();

    // Initialize King connection
    const { initializeConnection: initializeKingConnection } = await import('../king/js/core/initializeConnection.js');
    await initializeKingConnection();

    console.log("King game initialized successfully");
}

function loadKingStyles() {
    const kingStylesheets = [
        '/king/styles/king-main.css',
        '/king/styles/king-table.css', 
        '/king/styles/king-game-board.css',
        '/king/styles/king-responsive.css'
    ];

    kingStylesheets.forEach(href => {
        // Check if stylesheet is already loaded
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
            console.log('Loaded King stylesheet:', href);
        }
    });
}

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