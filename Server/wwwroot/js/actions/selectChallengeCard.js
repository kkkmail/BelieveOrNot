import {updatePreviousPlayDisplay} from "../display/updatePreviousPlayDisplay.js";
import {selectedChallengeIndex, setSelectedChallengeIndex} from "../core/variables.js";

export function selectChallengeCard(index) {
    console.log("selectChallengeCard called with index:", index);
    
    // Set the selected challenge index
    setSelectedChallengeIndex(index);

    // Update visual selection in challenge area - FIXED to use correct selectors
    const challengeCards = document.querySelectorAll('.challenge-card-display, .challenge-card');
    challengeCards.forEach((card, i) => {
        card.classList.remove('challenge-selected');
        if (i === index) {
            card.classList.add('challenge-selected');
        }
    });

    // FIXED: Also update the table display to show the selection
    updatePreviousPlayDisplay();

    console.log(`Selected challenge card at index: ${index} (synced with table display)`);
}