// js/utils/updateRankDropdown.js
import {gameState} from "../core/variables.js";

export function updateRankDropdown() {
    const declaredRankSelect = document.getElementById('declaredRank');

    if (!declaredRankSelect) return;

    // Clear existing options
    declaredRankSelect.innerHTML = '';

    // Add default empty option (forces user to choose)
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Choose rank...';
    defaultOption.selected = true;
    declaredRankSelect.appendChild(defaultOption);

    // Determine available ranks based on deck size (with fallback)
    let availableRanks = [];
    const deckSize = gameState?.deckSize || gameState?.DeckSize || 52; // Fallback to 52

    if (deckSize === 32) {
        availableRanks = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    } else if (deckSize === 36) {
        availableRanks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    } else { // 52 cards (default)
        availableRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    }

    // Filter out disposed ranks
    const disposedRanks = gameState?.disposedRanks || gameState?.DisposedRanks || [];
    const selectableRanks = availableRanks.filter(rank => !disposedRanks.includes(rank));

    console.log("Rank dropdown update:", {
        availableRanks,
        disposedRanks,
        selectableRanks
    });

    // Add rank options (excluding disposed ones)
    selectableRanks.forEach(rank => {
        const option = document.createElement('option');
        option.value = rank;
        option.textContent = rank;
        declaredRankSelect.appendChild(option);
    });

    // Show info if some ranks were filtered out
    if (disposedRanks.length > 0) {
        console.log(`Filtered out ${disposedRanks.length} disposed ranks: ${disposedRanks.join(', ')}`);
    }
}
