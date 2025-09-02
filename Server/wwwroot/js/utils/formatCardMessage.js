// Format card names with proper colors and larger fonts
function formatCardForMessage(card) {
    if (!card) return 'Unknown Card';
    
    if (card.rank === 'Joker' || card.Rank === 'Joker') {
        return '<span style="font-size: 1.2em; font-weight: bold;">🃏</span>';
    }
    
    const rank = card.rank || card.Rank || '?';
    const suit = card.suit || card.Suit || '';
    
    // Get suit symbol and color
    let suitSymbol = '';
    let color = '#333';
    
    switch(suit) {
        case 'Hearts':
            suitSymbol = '♥️';
            color = '#dc3545';
            break;
        case 'Diamonds':
            suitSymbol = '♦️';
            color = '#dc3545';
            break;
        case 'Clubs':
            suitSymbol = '♣️';
            color = '#333';
            break;
        case 'Spades':
            suitSymbol = '♠️';
            color = '#333';
            break;
        default:
            suitSymbol = suit;
            break;
    }
    
    return `<span style="color: ${color}; font-weight: bold; font-size: 1.3em;">${rank}</span><span style="color: ${color}; font-size: 1.1em;">${suitSymbol}</span>`;
}

// Format rank for disposal messages
function formatRankForMessage(rank) {
    return `<span style="font-weight: bold; font-size: 1.3em;">${rank}</span>`;
}

// Enhanced challenge message formatting
function formatChallengeMessage(message) {
    // Look for card patterns like "K of Clubs" or "Joker"
    let formatted = message;
    
    // Handle "Joker" mentions
    formatted = formatted.replace(/\bJoker\b/g, '<span style="font-size: 1.2em; font-weight: bold;">🃏</span>');
    
    // Handle rank + "of" + suit patterns
    const cardPattern = /\b([2-9]|10|J|Q|K|A)\s+of\s+(Hearts|Diamonds|Clubs|Spades)\b/g;
    formatted = formatted.replace(cardPattern, (match, rank, suit) => {
        const fakeCard = { rank: rank, suit: suit };
        return formatCardForMessage(fakeCard);
    });
    
    return formatted;
}

// Enhanced disposal message formatting
function formatDisposalMessage(message) {
    // Look for rank patterns in disposal messages like "disposed 4 of a kind: Ks"
    let formatted = message;
    
    // Handle "4 of a kind: [rank]s" pattern
    const disposalPattern = /(\w+s)(?=\s*\.)/g;
    formatted = formatted.replace(disposalPattern, (match) => {
        // Remove the 's' and format the rank
        const rank = match.slice(0, -1);
        return formatRankForMessage(rank) + 's';
    });
    
    return formatted;
}