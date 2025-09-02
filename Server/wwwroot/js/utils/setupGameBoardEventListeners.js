// NEW: Safer game board event setup that prevents duplicates
import {setupGameButtons} from "./setupGameButtons.js";
import {setupChallengeButtons} from "./setupChallengeButtons.js";
import {setupCopyButton} from "./setupCopyButton.js";

export function setupGameBoardEventListeners() {
    console.log("Setting up game board event listeners...");

    // Wait a bit for DOM to be ready
    setTimeout(() => {
        setupGameButtons();
        setupChallengeButtons();
        setupCopyButton(); // NEW: Setup copy match ID button
    }, 100);
}
