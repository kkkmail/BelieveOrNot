// Server/wwwroot/king/js/display/updateTrumpDisplay.js
import { getSuitSymbol } from "../../../js/cards/getSuitSymbol.js";
import { getSuitClass } from "../../../js/cards/getSuitClass.js";

export function updateTrumpDisplay(trumpSuit) {
    console.log("=== UPDATE TRUMP DISPLAY ===");
    console.log("trumpSuit:", trumpSuit);

    const trumpCard = document.getElementById('trumpCard');
    const trumpCardSuit = document.getElementById('trumpCardSuit');

    if (!trumpCard || !trumpCardSuit) {
        console.error("Trump card elements not found");
        return;
    }

    // Clear existing classes
    trumpCard.className = 'card';

    if (trumpSuit === null || trumpSuit === undefined || trumpSuit === '' || trumpSuit === 'null') {
        // Show blank card when no trump is set
        trumpCard.classList.add('blank');
        trumpCardSuit.textContent = '';
        console.log("Trump display: showing blank card");
    } else {
        // Show the trump suit symbol
        const suitClass = getSuitClass(trumpSuit);
        const suitSymbol = getSuitSymbol(trumpSuit);

        trumpCard.classList.add(suitClass);
        trumpCardSuit.textContent = suitSymbol;
        console.log(`Trump display: showing ${trumpSuit} (${suitSymbol}) with class ${suitClass}`);
    }
}
