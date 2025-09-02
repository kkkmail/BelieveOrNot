// Format player names - bold italic to stand out from cards
function formatPlayerName(playerName) {
    return `<span style="font-weight: bold; font-style: italic;">${playerName}</span>`;
}

// Format individual cards - colored bold rank + space + suit symbol
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

// Format rank collections (for disposal messages) - just bold rank
function formatRankForMessage(rank) {
    return `<span style="font-weight: bold; font-size: 1.3em;">${rank}</span>`;
}

// Enhanced message formatting with player names and cards
function formatGameMessage(message) {
    let formatted = message;
    
    // Format player names (look for common patterns)
    // Pattern: "PlayerName did something" - make PlayerName bold italic
    const playerActionPatterns = [
        /^([A-Za-z0-9\s\(\)]+)\s+(played|challenges|challenged|disposed|joined|created|started)/gi,
        /\b([A-Za-z0-9\s\(\)]+)\s+(was wrong|was right|collects)/gi,
        /\b([A-Za-z0-9\s\(\)]+)\s+(wins|ended)/gi
    ];
    
    playerActionPatterns.forEach(pattern => {
        formatted = formatted.replace(pattern, (match, playerName, action) => {
            return formatPlayerName(playerName.trim()) + ' ' + action;
        });
    });
    
    // Format individual cards (Joker and rank + suit patterns)
    formatted = formatted.replace(/\bJoker\b/g, '<span style="font-size: 1.2em; font-weight: bold;">🃏</span>');
    
    // Handle "rank of suit" patterns
    const cardPattern = /\b([2-9]|10|J|Q|K|A)\s+of\s+(Hearts|Diamonds|Clubs|Spades)\b/g;
    formatted = formatted.replace(cardPattern, (match, rank, suit) => {
        const fakeCard = { rank: rank, suit: suit };
        return formatCardForMessage(fakeCard);
    });
    
    // Format disposal messages - "4 of a kind: Ks" -> "4 of a kind: Ks"
    formatted = formatted.replace(/(\d\s+of\s+a\s+kind:\s+)(\w+)(s\.)/g, (match, prefix, rank, suffix) => {
        return prefix + formatRankForMessage(rank) + suffix;
    });
    
    return formatted;
}

// Legacy function names for compatibility
function formatChallengeMessage(message) {
    return formatGameMessage(message);
}

function formatDisposalMessage(message) {
    return formatGameMessage(message);
}