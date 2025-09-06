// js/utils/setupEventListeners.js
import { createMatch } from "../game/createMatch.js";
import { joinMatch } from "../game/joinMatch.js";
import { startRound } from "../game/startRound.js";
import { copyMatchId } from "../../../js/utils/copyMatchId.js"; // Reuse from BelieveOrNot

export function setupEventListeners() {
    console.log("Setting up event listeners...");

    // Setup form buttons
    setTimeout(() => {
        const createMatchBtn = document.getElementById('createMatchBtn');
        const joinMatchBtn = document.getElementById('joinMatchBtn');
        const startRoundBtn = document.getElementById('startRoundBtn');
        const copyMatchIdBtn = document.getElementById('copyMatchIdBtn');

        if (createMatchBtn && !createMatchBtn.hasAttribute('data-listener')) {
            createMatchBtn.setAttribute('data-listener', 'true');
            createMatchBtn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                console.log("Create match button clicked");
                // Use setTimeout to prevent blocking the UI
                setTimeout(() => createMatch(), 0);
            });
        }

        if (joinMatchBtn && !joinMatchBtn.hasAttribute('data-listener')) {
            joinMatchBtn.setAttribute('data-listener', 'true');
            joinMatchBtn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                console.log("Join match button clicked");
                // Use setTimeout to prevent blocking the UI
                setTimeout(() => joinMatch(), 0);
            });
        }

        if (startRoundBtn && !startRoundBtn.hasAttribute('data-listener')) {
            startRoundBtn.setAttribute('data-listener', 'true');
            startRoundBtn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                console.log("Start round button clicked");
                startRound();
            });
        }

        if (copyMatchIdBtn && !copyMatchIdBtn.hasAttribute('data-listener')) {
            copyMatchIdBtn.setAttribute('data-listener', 'true');
            copyMatchIdBtn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                console.log("Copy match ID button clicked");
                copyMatchId();
            });
        }
    }, 100);

    console.log("Event listeners set up");
}