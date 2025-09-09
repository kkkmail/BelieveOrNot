// Server/wwwroot/king/js/utils/setupEventListeners.js
import { setupGameButtons } from "./setupGameButtons.js";
import { setupFormButtons } from "./setupFormButtons.js";
import { showHelpModal } from "./showHelpModal.js";

export function setupEventListeners() {
    console.log("Setting up King game event listeners...");

    // Setup form buttons (these exist immediately)
    setupFormButtons();

    // Setup help button (exists immediately)
    setupHelpButton();

    // Setup game buttons (these are added after HTML is loaded)
    setTimeout(() => {
        setupGameButtons();
    }, 100);

    console.log("King game event listeners set up");
}

function setupHelpButton() {
    console.log("Setting up King help button...");
    
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn && !helpBtn.hasAttribute('data-king-listener')) {
        helpBtn.setAttribute('data-king-listener', 'true');
        helpBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("King help button clicked");
            showHelpModal();
        });
        console.log("King help button listener added");
    }
}