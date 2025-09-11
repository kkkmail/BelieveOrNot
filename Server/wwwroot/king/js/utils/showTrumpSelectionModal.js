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
                            <div class="card hand-card trump-selection-card ${getSuitClass(card.suit)}" style="
                                width: 80px;
                                height: 112px;
                                border: 2px solid #333;
                                border-radius: 8px;
                                background: white;
                                display: flex;
                                flex-direction: column;
                                justify-content: space-between;
                                padding: 12px;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                cursor: default;
                                margin: 5px;
                            ">
                                <div class="rank ${getSuitClass(card.suit)}" style="font-size: 24px; font-weight: bold; text-align: left; line-height: 1;">${card.rank}</div>
                                <div class="suit ${getSuitClass(card.suit)}" style="font-size: 36px; text-align: center; align-self: center; line-height: 1;">${suitSymbol}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    } else {
        console.log("No trump selection cards found or empty array");
        trumpCardsHtml = `
            <div style="margin-bottom: 20px;">
                <p style="color: #666; font-style: italic;">No trump selection cards available</p>
            </div>
        `;
    }

    // Create modal content
    modal.innerHTML = `
        <h2 style="margin: 0 0 20px 0; color: #333; font-size: 1.8em;">
            🎯 Choose Trump Suit
        </h2>
        ${trumpCardsHtml}
        <p style="margin: 0 0 30px 0; color: #666; font-size: 1.1em;">
            Select a trump suit for this collecting round:
        </p>
        <div class="trump-modal-buttons" style="display: flex; gap: 20px; justify-content: center; align-items: center;">
            <button class="trump-modal-btn spades" data-suit="Spades" style="
                padding: 25px;
                font-size: 48px;
                font-weight: bold;
                border: 3px solid #333;
                border-radius: 12px;
                cursor: pointer;
                background: white;
                color: #333;
                transition: all 0.3s ease;
                min-width: 80px;
                min-height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">♠</button>
            <button class="trump-modal-btn hearts" data-suit="Hearts" style="
                padding: 25px;
                font-size: 48px;
                font-weight: bold;
                border: 3px solid #dc3545;
                border-radius: 12px;
                cursor: pointer;
                background: white;
                color: #dc3545;
                transition: all 0.3s ease;
                min-width: 80px;
                min-height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">♥</button>
            <button class="trump-modal-btn diamonds" data-suit="Diamonds" style="
                padding: 25px;
                font-size: 48px;
                font-weight: bold;
                border: 3px solid #dc3545;
                border-radius: 12px;
                cursor: pointer;
                background: white;
                color: #dc3545;
                transition: all 0.3s ease;
                min-width: 80px;
                min-height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">♦</button>
            <button class="trump-modal-btn clubs" data-suit="Clubs" style="
                padding: 25px;
                font-size: 48px;
                font-weight: bold;
                border: 3px solid #333;
                border-radius: 12px;
                cursor: pointer;
                background: white;
                color: #333;
                transition: all 0.3s ease;
                min-width: 80px;
                min-height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">♣</button>
        </div>
    `;

    // Add event listeners to trump buttons
    const trumpButtons = modal.querySelectorAll('.trump-modal-btn');
    trumpButtons.forEach(button => {
        button.addEventListener('click', async function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            const suit = this.getAttribute('data-suit');
            console.log("Trump modal button clicked:", suit);
            
            // Hide the modal immediately
            closeTrumpSelectionModal();
            
            // Select the trump
            await selectTrump(suit);
        });
    });

    // Append to body
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    });

    console.log("Trump selection modal shown with cards:", trumpCards);
}

export function closeTrumpSelectionModal() {
    const overlay = document.getElementById('trumpSelectionModalOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
        console.log("Trump selection modal closed");
    }
}

export function hideTrumpSelectionModal() {
    closeTrumpSelectionModal();
}