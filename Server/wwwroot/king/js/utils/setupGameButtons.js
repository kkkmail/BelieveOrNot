// js/utils/setupGameButtons.js
import { startRound } from "../game/startRound.js";
import { selectTrump } from "../actions/selectTrump.js";
import { playCard } from "../actions/playCard.js";

export function setupGameButtons() {
    const startRoundBtn = document.getElementById('startRoundBtn');

    if (startRoundBtn && !startRoundBtn.hasAttribute('data-listener')) {
        startRoundBtn.setAttribute('data-listener', 'true');
        startRoundBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Start round button clicked");
            startRound();
        });
        console.log("Start round button listener added");
    }
}