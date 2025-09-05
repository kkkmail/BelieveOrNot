// js/utils/formatCardForMessage.js
import {getSuitSymbol} from "../cards/getSuitSymbol.js";

export function formatCardForMessage(card) {
    if (card.rank === 'Joker') {
        return '🃏';
    }
    return `${card.rank}${getSuitSymbol(card.suit)}`;
}