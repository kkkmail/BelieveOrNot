// Server/wwwroot/king/js/utils/setupGameButtons.js
import { startRound } from "../actions/startRound.js";
import { endRound } from "../actions/endRound.js";
import { playCard } from "../actions/playCard.js";
import { selectTrump } from "../actions/selectTrump.js";
import { copyMatchId } from "./copyMatchId.js";
import { showOtherGamesModal } from "../../../js/utils/showOtherGamesModal.js";

export function setupGameButtons() {
    console.log("Setting up King game buttons...");

    // Start Round button
    const startRoundBtn = document.getElementById('startRoundBtn');
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

    // End Round button
    const endRoundBtn = document.getElementById('endRoundBtn');
    if (endRoundBtn && !endRoundBtn.hasAttribute('data-listener')) {
        endRoundBtn.setAttribute('data-listener', 'true');
        endRoundBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("King end round button clicked");
            endRound();
        });
        console.log("King end round button listener added");
    }

    // Play Card button
    const playCardBtn = document.getElementById('playCardBtn');
    if (playCardBtn && !playCardBtn.hasAttribute('data-listener')) {
        playCardBtn.setAttribute('data-listener', 'true');
        playCardBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("King play card button clicked");
            playCard();
        });
        console.log("King play card button listener added");
    }

    // Copy Match ID button
    const copyMatchIdBtn = document.getElementById('copyMatchIdBtn');
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

    // Other Games button
    const otherGamesBtn = document.getElementById('otherGamesBtn');
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

    // Setup trump selection buttons (existing ones in the HTML, keeping as fallback)
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
