// js/display/updateTablePileDisplay.js
import {updatePreviousPlayDisplay} from "./updatePreviousPlayDisplay.js";
import {updateCardPileDisplay} from "./updateCardPileDisplay.js";

export function updateTablePileDisplay() {
    updateCardPileDisplay();
    updatePreviousPlayDisplay();
}
