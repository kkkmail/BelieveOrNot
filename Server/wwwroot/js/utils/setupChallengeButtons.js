import {hideChallenge} from "../actions/hideChallenge.js";
import {submitChallenge} from "../actions/submitChallenge.js";

export function setupChallengeButtons() {
    const submitChallengeBtn = document.getElementById('submitChallengeBtn');
    const hideChallengeBtn = document.getElementById('hideChallengeBtn');

    if (submitChallengeBtn && !submitChallengeBtn.hasAttribute('data-listener')) {
        submitChallengeBtn.setAttribute('data-listener', 'true');
        submitChallengeBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Submit challenge button clicked");
            submitChallenge();
        });
        console.log("Submit challenge button listener added");
    }

    if (hideChallengeBtn && !hideChallengeBtn.hasAttribute('data-listener')) {
        hideChallengeBtn.setAttribute('data-listener', 'true');
        hideChallengeBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Hide challenge button clicked");
            hideChallenge();
        });
        console.log("Hide challenge button listener added");
    }
}
