// js/cards/getSuitSymbol.js
export function getSuitSymbol(suit) {
    switch(suit) {
        case 'Spades': return '♠️';
        case 'Clubs': return '♣️';
        case 'Diamonds': return '♦️';
        case 'Hearts': return '♥️';

        case '0': return '♠️';
        case '1': return '♣️';
        case '2': return '♦️';
        case '3': return '♥️';

        case 0: return '♠️';
        case 1: return '♣️';
        case 2: return '♦️';
        case 3: return '♥️';

        default: return '🃏';
    }
}
