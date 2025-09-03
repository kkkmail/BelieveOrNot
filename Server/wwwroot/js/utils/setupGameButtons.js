// js/utils/setupGameButtons.js
import {showChallenge} from "../actions/showChallenge.js";
import {playCards} from "../actions/playCards.js";
import {startRound} from "../game/startRound.js";
import {endRound, endGame} from "../actions/gameManagement.js";

export function setupGameButtons() {
    const startRoundBtn = document.getElementById('startRoundBtn');
    const playBtn = document.getElementById('playBtn');
    const challengeBtn = document.getElementById('challengeBtn');
    const endRoundBtn = document.getElementById('endRoundBtn');
    const endGameBtn = document.getElementById('endGameBtn');

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

    if (playBtn && !playBtn.hasAttribute('data-listener')) {
        playBtn.setAttribute('data-listener', 'true');
        playBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Play button clicked");
            playCards();
        });
        console.log("Play button listener added");
    }

    if (challengeBtn && !challengeBtn.hasAttribute('data-listener')) {
        challengeBtn.setAttribute('data-listener', 'true');
        challengeBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Challenge button clicked");
            showChallenge();
        });
        console.log("Challenge button listener added");
    }

    // NEW: End round button
    if (endRoundBtn && !endRoundBtn.hasAttribute('data-listener')) {
        endRoundBtn.setAttribute('data-listener', 'true');
        endRoundBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("End round button clicked");
            endRound();
        });
        console.log("End round button listener added");
    }

    // NEW: End game button
    if (endGameBtn && !endGameBtn.hasAttribute('data-listener')) {
        endGameBtn.setAttribute('data-listener', 'true');
        endGameBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("End game button clicked");
            endGame();
        });
        console.log("End game button listener added");
    }
}