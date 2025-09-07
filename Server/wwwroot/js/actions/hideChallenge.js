// js/actions/hideChallenge.js
import {setSelectedChallengeIndex} from "../core/variables.js";
import {updatePreviousPlayDisplay} from "../display/updatePreviousPlayDisplay.js";
import {updateActionsDisplay} from "../display/updateActionsDisplay.js";

export function hideChallenge() {
    // Clear challenge selection
    setSelectedChallengeIndex(-1);

    // Update displays
    updatePreviousPlayDisplay();
    updateActionsDisplay();
}
