function getSuitSymbol(suit) {
    switch(suit) {
        case 'Hearts': return '♥️';
        case 'Diamonds': return '♦️';
        case 'Clubs': return '♣️';
        case 'Spades': return '♠️';
        default: return '🃏';
    }
}