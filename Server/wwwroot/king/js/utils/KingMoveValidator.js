// Server/wwwroot/king/js/utils/KingMoveValidator.js

export class KingMoveValidator {
    static canPlayCard(gameState, card, playerId) {
        console.log("=== KING MOVE VALIDATOR DEBUG ===");
        console.log("card:", card);
        console.log("playerId:", playerId);
        console.log("gameState.phase:", gameState?.phase);
        
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

        // Allow play if no current trick exists (start of new trick)
        if (!currentTrick) {
            console.log("VALID: No current trick, can start new trick");
            return true;
        }

        // If leading the trick (first card)
        if (!currentTrick.cards || currentTrick.cards.length === 0) {
            console.log("LEADING the trick");
            const canLead = this.isValidLead(gameState, card, currentRound);
            console.log("Can lead:", canLead);
            return canLead;
        }

        // Following to a trick (subsequent cards)
        console.log("FOLLOWING to a trick");
        const canFollow = this.isValidFollow(gameState, card, currentTrick);
        console.log("Can follow:", canFollow);
        return canFollow;
    }

    static isValidLead(gameState, card, round) {
        console.log("=== CHECKING LEAD VALIDITY ===");
        console.log("card:", card);
        console.log("round.cannotLeadHearts:", round?.cannotLeadHearts);
        
        // Special rule: Cannot lead Hearts in "Don't take Hearts" round unless no other choice
        if (round.cannotLeadHearts && card.suit === 'Hearts') {
            const nonHeartCards = gameState.yourHand?.filter(c => c.suit !== 'Hearts') || [];
            console.log("nonHeartCards:", nonHeartCards);
            if (nonHeartCards.length > 0) {
                console.log("INVALID LEAD: Cannot lead Hearts when other suits available");
                return false;
            }
        }

        console.log("VALID LEAD");
        return true;
    }

    static isValidFollow(gameState, card, trick) {
        console.log("=== CHECKING FOLLOW VALIDITY ===");
        console.log("card:", card);
        console.log("trick:", trick);
        console.log("trick.ledSuit:", trick?.ledSuit);
        console.log("trick.cards:", trick?.cards);
        
        // Get the lead suit from the first card played
        const leadSuit = trick.ledSuit;
        if (!leadSuit) {
            console.log("VALID FOLLOW: No lead suit specified");
            return true;
        }

        console.log("Lead suit is:", leadSuit);
        console.log("Card suit is:", card.suit);

        // Must follow suit if possible
        const sameSuitCards = gameState.yourHand?.filter(c => c.suit === leadSuit) || [];
        console.log("sameSuitCards in hand:", sameSuitCards);
        
        if (sameSuitCards.length > 0) {
            // Player has cards of the lead suit, must play one
            const canFollowSuit = card.suit === leadSuit;
            console.log("Must follow suit. Can follow:", canFollowSuit);
            
            if (!canFollowSuit) {
                console.log("INVALID FOLLOW: Must play", leadSuit, "but trying to play", card.suit);
            }
            
            return canFollowSuit;
        }

        // No cards of lead suit - can play any card
        console.log("VALID FOLLOW: No cards of lead suit, can play any card");
        return true;
    }

    static mustDiscardKingOfHearts(gameState, trick, round) {
        if (!round.mustDiscardKingOfHearts) {
            return false;
        }
        
        if (!trick || !trick.cards || trick.cards.length === 0) {
            return false; // Leading, not discarding
        }

        const kingOfHearts = gameState.yourHand?.find(c => 
            c.rank === 'King' && c.suit === 'Hearts'
        );
        if (!kingOfHearts) {
            return false;
        }

        const leadSuit = trick.ledSuit;
        const sameSuitCards = gameState.yourHand?.filter(c => c.suit === leadSuit) || [];

        // Must discard King of Hearts if cannot follow suit
        return sameSuitCards.length === 0;
    }
}