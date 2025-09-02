export function getSuitClass(suit) {
    if (suit === 'Hearts') return 'hearts';
    if (suit === 'Diamonds') return 'diamonds';
    if (suit === 'Clubs') return 'clubs';
    if (suit === 'Spades') return 'spades';
    return 'joker';
}
