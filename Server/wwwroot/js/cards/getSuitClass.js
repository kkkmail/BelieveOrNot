// js/cards/getSuitClass.js
export function getSuitClass(suit) {
    if (suit === 'Hearts') return 'hearts';
    if (suit === 'Diamonds') return 'diamonds';
    if (suit === 'Clubs') return 'clubs';
    if (suit === 'Spades') return 'spades';

    if (suit === '0') return 'spades';
    if (suit === '1') return 'clubs';
    if (suit === '2') return 'diamonds';
    if (suit === '3') return 'hearts';


    if (suit === 0) return 'spades';
    if (suit === 1) return 'clubs';
    if (suit === 2) return 'diamonds';
    if (suit === 3) return 'hearts';

    return 'joker';
}
