// js/actions/hideChallenge.js
import {setSelectedChallengeIndex} from "../core/variables.js";
import {updatePreviousPlayDisplay} from "../display/updatePreviousPlayDisplay.js";
import {updateActionsDisplay} from "../display/updateActionsDisplay.js";
import {clearRankSelection} from "../utils/updateRankButtons.js";

export function hideChallenge() {
    // Clear challenge selection
    setSelectedChallengeIndex(-1);
    clearRankSelection();

    // Update displays
    updatePreviousPlayDisplay();
    updateActionsDisplay();
}
