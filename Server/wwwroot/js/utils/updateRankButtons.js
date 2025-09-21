// js/utils/updateRankButtons.js
import {gameState} from "../core/variables.js";

let selectedRank = null;

export function updateRankButtons() {
    const rankButtonsContainer = document.getElementById('rankButtonsContainer');

    if (!rankButtonsContainer) return;

    // Clear existing buttons
    rankButtonsContainer.innerHTML = '';
    selectedRank = null;

    // Determine available ranks based on deck size
    let availableRanks = [];
    const deckSize = gameState?.deckSize || gameState?.DeckSize || 52;

    if (deckSize === 32) {
        availableRanks = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    } else if (deckSize === 36) {
        availableRanks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    } else { // 52 cards
        availableRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    }

    // Filter out disposed ranks
    const disposedRanks = gameState?.disposedRanks || gameState?.DisposedRanks || [];
    const selectableRanks = availableRanks.filter(rank => !disposedRanks.includes(rank));

    console.log("Rank buttons update:", {
        availableRanks,
        disposedRanks,
        selectableRanks
    });

    // Create buttons for each rank
    selectableRanks.forEach(rank => {
        const button = document.createElement('div');
        button.className = 'rank-button';
        button.dataset.rank = rank;

        const rankDisplay = document.createElement('div');
        rankDisplay.className = 'rank-display';
        rankDisplay.textContent = rank;
        button.appendChild(rankDisplay);

        // Add click handler
        button.addEventListener('click', function() {
            selectRank(rank);
        });

        rankButtonsContainer.appendChild(button);
    });

    // Show info if some ranks were filtered
    if (disposedRanks.length > 0) {
        console.log(`Filtered out ${disposedRanks.length} disposed ranks: ${disposedRanks.join(', ')}`);
    }
}

export function selectRank(rank) {
    // Remove previous selection
    const buttons = document.querySelectorAll('.rank-button');
    buttons.forEach(btn => btn.classList.remove('selected'));

    // Add selection to clicked button
    const selectedButton = document.querySelector(`.rank-button[data-rank="${rank}"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
        selectedRank = rank;
        console.log('Selected rank:', rank);
    }
}

export function getSelectedRank() {
    return selectedRank;
}

export function clearRankSelection() {
    selectedRank = null;
    const buttons = document.querySelectorAll('.rank-button');
    buttons.forEach(btn => btn.classList.remove('selected'));
}
