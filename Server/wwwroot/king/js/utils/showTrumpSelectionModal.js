// Server/wwwroot/king/js/utils/showTrumpSelectionModal.js
import { selectTrump } from "../actions/selectTrump.js";
import { gameState, playerId } from "../core/variables.js";
import { getSuitSymbol } from "../../../js/cards/getSuitSymbol.js";
import { getSuitClass } from "../../../js/cards/getSuitClass.js";

export function showTrumpSelectionModal() {
    console.log("=== SHOWING TRUMP SELECTION MODAL ===");

    if (!gameState || !playerId) {
        console.error("Cannot show trump selection modal: missing game state or player ID");
        return;
    }

    // Debug: Log TrumSelectionCards extensively
    console.log("=== TRUMP SELECTION DEBUG ===");
    console.log("gameState.trumpSelectionCards:", gameState.trumpSelectionCards);
    console.log("gameState.yourHand:", gameState.yourHand);
    console.log("gameState.waitingForTrumpSelection:", gameState.waitingForTrumpSelection);
    console.log("gameState.currentPlayerIndex:", gameState.currentPlayerIndex);
    console.log("gameState.players:", gameState.players);
    console.log("playerId:", playerId);
    console.log("currentRound:", gameState.currentRound);
    console.log("Full gameState object:", gameState);

    // Check for TrumSelectionCards
    const trumpCards = gameState.trumpSelectionCards;
    console.log("trumpCards to display:", trumpCards);
    console.log("trumpCards length:", trumpCards ? trumpCards.length : "undefined");

    // Check if this player should be choosing trump
    const currentPlayer = gameState.players?.[gameState.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.id !== playerId) {
        console.log("Not showing trump selection modal: not this player's turn");
        console.log("Current player ID:", currentPlayer?.id, "My ID:", playerId);
        return;
    }

    if (!gameState.waitingForTrumpSelection) {
        console.log("Not showing trump selection modal: not waiting for trump selection");
        return;
    }

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'trumpSelectionModalOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 20px;
        box-sizing: border-box;
    `;

    // Create modal panel
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 15px;
        box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
        max-width: 600px;
        width: 100%;
        padding: 30px;
        text-align: center;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;

    // Create trump selection cards HTML
    let trumpCardsHtml = '';

    if (trumpCards && trumpCards.length > 0) {
        console.log("Creating HTML for trump selection cards:", trumpCards);
        trumpCardsHtml = `
            <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 1.3em;">Your Trump Selection Cards</h3>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
                    ${trumpCards.map((card, index) => {
                        const suitClass = getSuitClass(card.suit);
                        const suitSymbol = getSuitSymbol(card.suit);
                        return `
                            <div class="card">
                                <div class="rank ${suitClass}">${card.rank}</div>
                                <div class="suit ${suitClass}">${suitSymbol}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Set modal content
    modal.innerHTML = `
        <h2 style="margin: 0 0 20px 0; color: #333; font-size: 1.5em;">Choose Trump Suit</h2>
        ${trumpCardsHtml}        
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <div class="card trump-btn" data-suit="Spades" style="cursor: pointer; user-select: none;">
                <div class="suit spades" style="pointer-events: none;">${getSuitSymbol('Spades')}</div>
            </div>
            <div class="card trump-btn" data-suit="Clubs" style="cursor: pointer; user-select: none;">
                <div class="suit clubs" style="pointer-events: none;">${getSuitSymbol('Clubs')}</div>
            </div>
            <div class="card trump-btn" data-suit="Diamonds" style="cursor: pointer; user-select: none;">
                <div class="suit diamonds" style="pointer-events: none;">${getSuitSymbol('Diamonds')}</div>
            </div>
            <div class="card trump-btn" data-suit="Hearts" style="cursor: pointer; user-select: none;">
                <div class="suit hearts" style="pointer-events: none;">${getSuitSymbol('Hearts')}</div>
            </div>
        </div>        
    `;

    // Add click handlers for trump buttons
    modal.addEventListener('click', async (e) => {
        const trumpBtn = e.target.closest('.trump-btn');
        if (trumpBtn) {
            const selectedSuit = trumpBtn.dataset.suit;
            console.log("Trump suit selected:", selectedSuit);

            // Visual feedback
            trumpBtn.style.background = '#e3f2fd';
            trumpBtn.style.borderColor = '#2196f3';
            trumpBtn.style.pointerEvents = 'none';

            try {
                await selectTrump(selectedSuit);
                closeTrumpSelectionModal();
            } catch (error) {
                console.error("Error selecting trump:", error);
                // Reset button state
                trumpBtn.style.background = '';
                trumpBtn.style.borderColor = '';
                trumpBtn.style.pointerEvents = '';
            }
        }
    });

    // Add close handler for overlay clicks
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            // Don't allow closing by clicking outside - player must choose trump
            console.log("Cannot close trump selection - must choose trump");
        }
    });

    // Add to document and animate in
    document.body.appendChild(overlay);
    overlay.appendChild(modal);

    // Trigger animations
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    });

    console.log("Trump selection modal created and shown");
}

export function closeTrumpSelectionModal() {
    const overlay = document.getElementById('trumpSelectionModalOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.querySelector('div').style.transform = 'scale(0.9)';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
        console.log("Trump selection modal closed");
    }
}
