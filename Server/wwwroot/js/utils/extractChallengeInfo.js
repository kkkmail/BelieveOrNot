// js/utils/extractChallengeInfo.js
// Extract challenge card information from server message

export function extractChallengeInfo(challengeMessage) {
    console.log("Extracting challenge info from message:", challengeMessage);
    
    // Parse challenge message to extract revealed card information
    // Expected format from MessageFormatter.ChallengeResult:
    // "Challenged card was <span style="...">K</span> <span style="...">♠</span> (matches/does not match <span style="...">K</span>). ..."
    
    // Handle Joker case first
    if (challengeMessage.includes('🃏')) {
        console.log("Found Joker in challenge message");
        const isMatch = challengeMessage.includes('matches') && !challengeMessage.includes('does not match');
        return {
            revealedCard: { rank: 'Joker', suit: 'Joker' },
            isMatch: isMatch
        };
    }
    
    // Look for the pattern "Challenged card was" followed by formatted HTML
    const cardMatch = challengeMessage.match(/Challenged card was\s+(.+?)\s+\(/);
    if (!cardMatch) {
        console.error("Could not extract revealed card from challenge message");
        return null;
    }
    
    const cardSection = cardMatch[1];
    console.log("Extracted card section:", cardSection);
    
    // Parse HTML spans to extract rank and suit
    // Format: <span style="...">RANK</span> <span style="...">SUIT_SYMBOL</span>
    const rankMatch = cardSection.match(/<span[^>]*>([^<]+)<\/span>/);
    const suitMatch = cardSection.match(/<span[^>]*>[^<]+<\/span>\s*<span[^>]*>([^<]+)<\/span>/);
    
    if (!rankMatch || !suitMatch) {
        console.error("Could not parse rank and suit from card section:", cardSection);
        return null;
    }
    
    const rank = rankMatch[1].trim();
    const suitSymbol = suitMatch[1].trim();
    
    console.log("Extracted rank:", rank, "suit symbol:", suitSymbol);
    
    // Convert suit symbol back to suit name
    const suitMap = {
        '♠': 'Spades',
        '♠️': 'Spades',
        '♥': 'Hearts', 
        '♥️': 'Hearts',
        '♦': 'Diamonds',
        '♦️': 'Diamonds',
        '♣': 'Clubs',
        '♣️': 'Clubs'
    };
    
    const suit = suitMap[suitSymbol] || 'Unknown';
    
    // Determine if it was a match or not
    // Look for "matches" but not "does not match"
    const isMatch = challengeMessage.includes('matches') && !challengeMessage.includes('does not match');
    
    console.log("Extracted challenge info:", { rank, suit, isMatch });
    
    return {
        revealedCard: { rank, suit },
        isMatch
    };
}