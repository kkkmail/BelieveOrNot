// js/utils/setupCopyButton.js
// NEW: Setup copy match ID button
import {copyMatchId} from "./copyMatchId.js";

export function setupCopyButton() {
    const copyMatchIdBtn = document.getElementById('copyMatchIdBtn');

    if (copyMatchIdBtn && !copyMatchIdBtn.hasAttribute('data-listener')) {
        copyMatchIdBtn.setAttribute('data-listener', 'true');
        copyMatchIdBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Copy match ID button clicked");
            copyMatchId();
        });
        console.log("Copy match ID button listener added");
    }
}
