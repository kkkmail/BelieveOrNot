// js/utils/setupGameButtons.js
import {playCards} from "../actions/playCards.js";
import {startRound} from "../game/startRound.js";
import {endRound} from "../actions/endRound.js";
import {endGame} from "../actions/endGame.js";
import {newGame} from "../actions/newGame.js";
import {submitChallenge} from "../actions/submitChallenge.js";

export function setupGameButtons() {
    const startRoundBtn = document.getElementById('startRoundBtn');
    const playBtn = document.getElementById('playBtn');
    const confirmChallengeBtn = document.getElementById('confirmChallengeBtn');
    const endRoundBtn = document.getElementById('endRoundBtn');
    const endGameBtn = document.getElementById('endGameBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    const otherGamesBtn = document.getElementById('otherGamesBtn');
    const helpBtn = document.getElementById('helpBtn');

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

    if (confirmChallengeBtn && !confirmChallengeBtn.hasAttribute('data-listener')) {
        confirmChallengeBtn.setAttribute('data-listener', 'true');
        confirmChallengeBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Confirm challenge button clicked");
            submitChallenge();
        });
        console.log("Confirm challenge button listener added");
    }

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

    if (newGameBtn && !newGameBtn.hasAttribute('data-listener')) {
        newGameBtn.setAttribute('data-listener', 'true');
        newGameBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("New game button clicked");
            newGame();
        });
        console.log("New game button listener added");
    }

    if (otherGamesBtn && !otherGamesBtn.hasAttribute('data-listener')) {
        otherGamesBtn.setAttribute('data-listener', 'true');
        otherGamesBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Other games button clicked");
            window.open('other-games.html', '_blank');
        });
        console.log("Other games button listener added");
    }

    if (helpBtn && !helpBtn.hasAttribute('data-listener')) {
        helpBtn.setAttribute('data-listener', 'true');
        helpBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Help button clicked");
            window.open('help.html', '_blank');
        });
        console.log("Help button listener added");
    }
}