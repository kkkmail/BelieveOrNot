// Format individual cards - colored bold rank + space + suit symbol
export function formatCardForMessage(card) {
    if (!card) return 'Unknown Card';

    if (card.rank === 'Joker' || card.Rank === 'Joker') {
        return '<span style="font-size: 1.2em; font-weight: bold;">🃏</span>';
    }

    const rank = card.rank || card.Rank || '?';
    const suit = card.suit || card.Suit || '';

    // Get suit symbol and color
    let suitSymbol = '';
    let color = '#333';

    switch (suit) {
        case 'Hearts':
            suitSymbol = '♥';
            color = '#dc3545';
            break;
        case 'Diamonds':
            suitSymbol = '♦';
            color = '#dc3545';
            break;
        case 'Clubs':
            suitSymbol = '♣';
            color = '#333';
            break;
        case 'Spades':
            suitSymbol = '♠';
            color = '#333';
            break;
        default:
            suitSymbol = suit;
            break;
    }

    // Bold rank + space + suit symbol
    return `<span style="color: ${color}; font-weight: bold; font-size: 1.3em;">${rank}</span> <span style="color: ${color}; font-size: 1.1em;">${suitSymbol}</span>`;
}
