function updateCardPlayPreview() {
    // Find or create preview area
    let previewArea = document.getElementById('cardPlayPreview');
    if (!previewArea) {
        // Create preview area if it doesn't exist
        const handArea = document.querySelector('.hand-area');
        if (handArea) {
            previewArea = document.createElement('div');
            previewArea.id = 'cardPlayPreview';
            previewArea.style.cssText = `
                margin: 10px 0;
                padding: 10px;
                background: rgba(0, 123, 255, 0.1);
                border: 2px dashed #007bff;
                border-radius: 8px;
                text-align: center;
                font-weight: bold;
                min-height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            // Insert before actions area
            const actionsArea = document.getElementById('actionsArea');
            handArea.insertBefore(previewArea, actionsArea);
        }
    }

    if (!previewArea) return;

    // Hide when round ends
    if (gameState && gameState.phase === 2) { // RoundEnd
        previewArea.style.display = 'none';
        return;
    }

    if (selectedCards.length === 0) {
        previewArea.style.display = 'none';
        return;
    }

    previewArea.style.display = 'flex';

    // Get the actual cards that will be played
    if (!gameState || !gameState.yourHand) {
        previewArea.innerHTML = 'No cards available';
        return;
    }

    // Sort hand the same way as in updateHandDisplay
    const sortedHand = [...gameState.yourHand].sort((a, b) => {
        if (a.rank === 'Joker' && b.rank !== 'Joker') return -1;
        if (a.rank !== 'Joker' && b.rank === 'Joker') return 1;
        if (a.rank === 'Joker' && b.rank === 'Joker') return 0;

        const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const aRankIndex = rankOrder.indexOf(a.rank);
        const bRankIndex = rankOrder.indexOf(b.rank);

        if (aRankIndex !== bRankIndex) {
            return aRankIndex - bRankIndex;
        }

        const suitOrder = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
        return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    });

    const cardsToPlay = selectedCards.map(index => sortedHand[index]).filter(card => card);
    
    if (cardsToPlay.length === 0) {
        previewArea.innerHTML = 'Invalid selection';
        return;
    }

    const cardNames = cardsToPlay.map(card => {
        if (card.rank === 'Joker') {
            return 'Joker';
        } else {
            const suitSymbol = getSuitSymbol(card.suit);
            return `${card.rank}${suitSymbol}`;
        }
    });

    // FIXED: Check if cards were just played (use global flag)
    const actionText = window.cardsJustPlayed ? 'Played in order' : 'Will play in order';
    
    previewArea.innerHTML = `
        <div style="color: #007bff;">
            ${actionText}: ${cardNames.join(' → ')}
            ${cardsToPlay.length === 1 ? ' (1 card)' : ` (${cardsToPlay.length} cards)`}
        </div>
    `;
}