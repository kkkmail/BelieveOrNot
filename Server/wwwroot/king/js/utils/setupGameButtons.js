// Server/wwwroot/king/js/utils/setupGameButtons.js
import { startRound } from "../actions/startRound.js";
import { newGame } from "../actions/newGame.js";
import { selectTrump } from "../actions/selectTrump.js";
import { showOtherGamesModal } from "../../../js/utils/showOtherGamesModal.js";
import { showHelpModal } from "../../../js/utils/showHelpModal.js";
import { copyMatchId } from "./copyMatchId.js";

export function setupGameButtons() {
    const startRoundBtn = document.getElementById('startRoundBtn');
    const otherGamesBtn = document.getElementById('otherGamesBtn');
    const helpBtn = document.getElementById('helpBtn');
    const copyMatchIdBtn = document.getElementById('copyMatchIdBtn');

    if (startRoundBtn && !startRoundBtn.hasAttribute('data-listener')) {
        startRoundBtn.setAttribute('data-listener', 'true');
        startRoundBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("King start round button clicked");
            startRound();
        });
        console.log("King start round button listener added");
    }

    if (otherGamesBtn && !otherGamesBtn.hasAttribute('data-listener')) {
        otherGamesBtn.setAttribute('data-listener', 'true');
        otherGamesBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("King other games button clicked");
            showOtherGamesModal();
        });
        console.log("King other games button listener added");
    }

    if (helpBtn && !helpBtn.hasAttribute('data-listener')) {
        helpBtn.setAttribute('data-listener', 'true');
        helpBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("King help button clicked");
            showHelpModal();
        });
        console.log("King help button listener added");
    }

    if (copyMatchIdBtn && !copyMatchIdBtn.hasAttribute('data-listener')) {
        copyMatchIdBtn.setAttribute('data-listener', 'true');
        copyMatchIdBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("King copy match ID button clicked");
            copyMatchId();
        });
        console.log("King copy match ID button listener added");
    }

    // Setup trump selection buttons
    setupTrumpButtons();
}

function setupTrumpButtons() {
    const trumpButtons = document.querySelectorAll('.trump-btn');
    
    trumpButtons.forEach(button => {
        if (!button.hasAttribute('data-listener')) {
            button.setAttribute('data-listener', 'true');
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                
                const suit = this.getAttribute('data-suit');
                console.log("Trump button clicked:", suit);
                selectTrump(suit);
            });
        }
    });
    
    console.log("Trump selection buttons set up");
}