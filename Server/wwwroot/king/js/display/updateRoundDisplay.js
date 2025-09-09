// Server/wwwroot/king/js/display/updateRoundDisplay.js
import { gameState } from "../core/variables.js";

export function updateRoundDisplay() {
    const roundNumber = document.getElementById('roundNumber');
    const totalRounds = document.getElementById('totalRounds');
    const currentRoundType = document.getElementById('currentRoundType');
    const roundName = document.getElementById('roundName');
    const roundDescription = document.getElementById('roundDescription');
    const roundRules = document.getElementById('roundRules');

    if (!gameState) return;

    // Update round numbers
    if (roundNumber) {
        roundNumber.textContent = gameState.currentRoundIndex + 1;
    }
    
    if (totalRounds && gameState.currentRound) {
        // Calculate total rounds based on game settings
        const baseRounds = 6; // Standard avoiding rounds
        const avoidEverythingRounds = gameState.settings?.includeAvoidEverythingRound ? 1 : 0;
        const collectingRounds = gameState.settings?.collectingPhaseRounds || 8;
        const total = baseRounds + avoidEverythingRounds + collectingRounds;
        totalRounds.textContent = total;
    }

    const currentRound = gameState.currentRound;
    if (!currentRound) {
        // No current round
        if (currentRoundType) currentRoundType.textContent = '-';
        if (roundName) roundName.textContent = 'Waiting for round to start';
        if (roundDescription) roundDescription.textContent = '-';
        if (roundRules) roundRules.innerHTML = '';
        return;
    }

    // Update round type
    if (currentRoundType) {
        currentRoundType.textContent = currentRound.name;
        currentRoundType.className = currentRound.isCollectingPhase ? 'round-type-collecting' : 'round-type-avoiding';
    }

    // Update round details
    if (roundName) {
        roundName.textContent = currentRound.name;
    }

    if (roundDescription) {
        roundDescription.textContent = currentRound.description;
    }

    // Update special rules
    if (roundRules) {
        const rules = [];
        
        if (currentRound.cannotLeadHearts) {
            rules.push('Cannot lead with Hearts (unless no other choice)');
        }
        
        if (currentRound.mustDiscardKingOfHearts) {
            rules.push('Must discard King of Hearts when cannot follow suit');
        }
        
        if (currentRound.canEndEarly) {
            rules.push('Round can end early when condition is met');
        }

        if (currentRound.isCollectingPhase) {
            rules.push(`+${currentRound.pointsPerTrick} points per trick`);
            if (gameState.selectedTrumpSuit) {
                rules.push(`Trump suit: ${gameState.selectedTrumpSuit}`);
            }
        } else {
            // Avoiding phase - show penalties
            if (currentRound.pointsPerTrick < 0) {
                rules.push(`${currentRound.pointsPerTrick} points per trick`);
            }
            if (currentRound.pointsPerHeart < 0) {
                rules.push(`${currentRound.pointsPerHeart} points per Heart`);
            }
            if (currentRound.pointsPerBoy < 0) {
                rules.push(`${currentRound.pointsPerBoy} points per Jack/King`);
            }
            if (currentRound.pointsPerQueen < 0) {
                rules.push(`${currentRound.pointsPerQueen} points per Queen`);
            }
            if (currentRound.pointsPerLastTrick < 0) {
                rules.push(`${currentRound.pointsPerLastTrick} points for each of last 2 tricks`);
            }
            if (currentRound.pointsForKingOfHearts < 0) {
                rules.push(`${currentRound.pointsForKingOfHearts} points for King of Hearts`);
            }
        }

        if (rules.length > 0) {
            roundRules.innerHTML = `
                <h4>Rules for this round:</h4>
                <ul>${rules.map(rule => `<li>${rule}</li>`).join('')}</ul>
            `;
        } else {
            roundRules.innerHTML = '';
        }
    }

    // Update progress indicators
    updateRoundProgress();
}

function updateRoundProgress() {
    const progressBar = document.querySelector('.progress-fill');
    const trickCounter = document.querySelector('.trick-counter');
    
    if (!gameState?.completedTricks) return;

    const completedTricks = gameState.completedTricks.length;
    const totalTricks = 8; // Always 8 tricks in King game
    const progressPercentage = (completedTricks / totalTricks) * 100;

    if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
    }

    if (trickCounter) {
        trickCounter.textContent = `Tricks completed: ${completedTricks}/${totalTricks}`;
    }
}