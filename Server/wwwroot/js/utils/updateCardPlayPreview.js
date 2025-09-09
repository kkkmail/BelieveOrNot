// js/utils/updateCardPlayPreview.js
import {getSuitSymbol} from "../cards/getSuitSymbol.js";
import {gameState, selectedCards} from "../core/variables.js";

export function updateCardPlayPreview() {
    // No longer create or manage a separate preview area
    // This functionality is now integrated into updateActionsDisplay
    // which updates the table message area directly
    
    console.log("updateCardPlayPreview called - functionality moved to updateActionsDisplay");
}
