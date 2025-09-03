import {setSelectedChallengeIndex} from "../core/variables.js";
import {updatePreviousPlayDisplay} from "../display/updatePreviousPlayDisplay.js";

export function hideChallenge() {
    document.getElementById('challengeArea').classList.add('hidden');
    setSelectedChallengeIndex(-1);

    // FIXED: Also clear table selection when challenge is cancelled
    updatePreviousPlayDisplay();
}
