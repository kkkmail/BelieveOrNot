// Server/wwwroot/king/js/utils/KingMoveValidator.js

export class KingMoveValidator {
    // Map C# Suit enum values to string names
    // C# enum: Spades=0, Clubs=1, Diamonds=2, Hearts=3
    static getSuitName(suitEnum) {
        switch(suitEnum) {
            case 0: return 'Spades';
            case 1: return 'Clubs';
            case 2: return 'Diamonds';
            case 3: return 'Hearts';
            default: return null;
        }
    }

    static canPlayCard(gameState, card, playerId) {
        console.log("=== KING MOVE VALIDATOR DEBUG ===");
        console.log("card:", card);
        console.log("playerId:", playerId);
        console.log("gameState.phase:", gameState?.phase);
        
        // Basic game state checks
        if (!gameState || gameState.phase !== 1) { // Not in progress
            console.log("INVALID: Game not in progress");
            return false;
        }

        // Check if it's player's turn
        const currentPlayer = gameState.players?.[gameState.currentPlayerIndex];
        console.log("currentPlayer:", currentPlayer);
        console.log("currentPlayerIndex:", gameState.currentPlayerIndex);
        
        if (!currentPlayer || currentPlayer.id !== playerId) {
            console.log("INVALID: Not player's turn. Current player ID:", currentPlayer?.id, "vs playerId:", playerId);
            return false;
        }

        // Check if waiting for trump selection
        if (gameState.waitingForTrumpSelection) {
            console.log("INVALID: Waiting for trump selection");
            return false;
        }

        const currentTrick = gameState.currentTrick;
        const currentRound = gameState.currentRound;
        console.log("currentTrick:", currentTrick);
        console.log("currentRound:", currentRound);
        
        if (!currentRound) {
            console.log("INVALID: No current round");
            return false;
        }

        // Check if player has the card
        if (!gameState.yourHand?.some(c => c.rank === card.rank && c.suit === card.suit)) {
            console.log("INVALID: Player doesn't have this card");
            return false;
        }

        // Now validate the specific card against game rules
        
        // If no current trick exists or trick is empty, this is a lead
        if (!currentTrick || !currentTrick.cards || currentTrick.cards.length === 0) {
            console.log("LEADING the trick - validating lead rules for card:", card);
            return this.isValidLead(gameState, card, currentRound);
        }

        // Following to a trick (subsequent cards)
        console.log("FOLLOWING to a trick - validating follow rules for card:", card);
        return this.isValidFollow(gameState, card, currentTrick, currentRound);
    }

    static isValidLead(gameState, card, round) {
        console.log("=== CHECKING LEAD VALIDITY ===");
        console.log("Checking if card can lead:", card);
        console.log("Round rules:", round);
        
        // Special rule: Cannot lead Hearts in "Don't take Hearts" round unless no other choice
        if (round?.cannotLeadHearts && card.suit === 'Hearts') {
            const nonHeartCards = gameState.yourHand?.filter(c => c.suit !== 'Hearts') || [];
            console.log("Hearts lead restriction active - checking other suits");
            console.log("Non-Heart cards available:", nonHeartCards.length);
            
            if (nonHeartCards.length > 0) {
                console.log("INVALID LEAD: Cannot lead Hearts when other suits available");
                return false;
            }
            console.log("VALID LEAD: Can lead Hearts as only suit available");
        }

        console.log("VALID LEAD: Card can lead");
        return true;
    }

    static isValidFollow(gameState, card, trick, round) {
        console.log("=== CHECKING FOLLOW VALIDITY ===");
        console.log("Checking if card can follow:", card);
        console.log("Current trick:", trick);
        console.log("Lead suit (raw enum):", trick?.ledSuit);
        console.log("Round:", round);
        
        // Get the lead suit from the first card played
        const leadSuitEnum = trick.ledSuit;
        if (leadSuitEnum === null || leadSuitEnum === undefined) {
            console.log("VALID FOLLOW: No lead suit specified");
            return true;
        }

        // Convert enum value to string name
        const leadSuit = this.getSuitName(leadSuitEnum);
        if (!leadSuit) {
            console.log("VALID FOLLOW: Unknown lead suit enum value:", leadSuitEnum);
            return true;
        }

        console.log(`Lead suit is ${leadSuit} (enum: ${leadSuitEnum}), card suit is ${card.suit}`);

        // Check if player has cards of the lead suit
        const sameSuitCards = gameState.yourHand?.filter(c => c.suit === leadSuit) || [];
        console.log(`Player has ${sameSuitCards.length} cards of lead suit ${leadSuit}:`, sameSuitCards.map(c => `${c.rank} of ${c.suit}`));
        
        if (sameSuitCards.length > 0) {
            // Player has cards of the lead suit, must play one of them
            const isMatchingSuit = card.suit === leadSuit;
            console.log(`Must follow suit. This card matches: ${isMatchingSuit}`);
            
            if (!isMatchingSuit) {
                console.log(`INVALID FOLLOW: Must play ${leadSuit} but trying to play ${card.suit}`);
                return false;
            }
            
            console.log("VALID FOLLOW: Playing required suit");
            return true;
        }

        // Player has no cards of lead suit - check King of Hearts rule
        if (round?.mustDiscardKingOfHearts) {
            const kingOfHearts = gameState.yourHand?.find(c => 
                c.rank === 'K' && c.suit === 'Hearts'
            );
            
            if (kingOfHearts) {
                const isKingOfHearts = card.rank === 'K' && card.suit === 'Hearts';
                console.log(`King of Hearts rule active. Player has King of Hearts. Playing King of Hearts: ${isKingOfHearts}`);
                
                if (!isKingOfHearts) {
                    console.log("INVALID FOLLOW: Must discard King of Hearts when cannot follow suit");
                    return false;
                }
                
                console.log("VALID FOLLOW: Playing required King of Hearts");
                return true;
            }
        }

        // No cards of lead suit and no King of Hearts requirement - can play any card
        console.log("VALID FOLLOW: No cards of lead suit, can play any card");
        return true;
    }

    static mustDiscardKingOfHearts(gameState, trick, round) {
        if (!round?.mustDiscardKingOfHearts) {
            return false;
        }
        
        if (!trick || !trick.cards || trick.cards.length === 0) {
            return false; // Leading, not discarding
        }

        const kingOfHearts = gameState.yourHand?.find(c => 
            c.rank === 'K' && c.suit === 'Hearts'
        );
        if (!kingOfHearts) {
            return false;
        }

        const leadSuitEnum = trick.ledSuit;
        const leadSuit = this.getSuitName(leadSuitEnum);
        const sameSuitCards = gameState.yourHand?.filter(c => c.suit === leadSuit) || [];

        // Must discard King of Hearts if cannot follow suit
        return sameSuitCards.length === 0;
    }
}