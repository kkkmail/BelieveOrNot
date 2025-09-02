// Enhanced message formatting with player names and cards
import {formatPlayerName} from "./formatPlayerName.js";
import {formatCardForMessage} from "./formatCardForMessage.js";
import {formatRankForMessage} from "./formatRankForMessage.js";

export function formatGameMessage(message) {
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
        const fakeCard = {rank: rank, suit: suit};
        return formatCardForMessage(fakeCard);
    });

    // Format disposal messages - "4 of a kind: Ks" -> "4 of a kind: Ks"
    formatted = formatted.replace(/(\d\s+of\s+a\s+kind:\s+)(\w+)(s\.)/g, (match, prefix, rank, suffix) => {
        return prefix + formatRankForMessage(rank) + suffix;
    });

    return formatted;
}
