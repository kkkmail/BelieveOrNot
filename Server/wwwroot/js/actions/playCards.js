// js/actions/playCards.js
import {connection, gameState, playerId, selectedCards, setSelectedCards} from "../core/variables.js";
import {updateActionsDisplay} from "../display/updateActionsDisplay.js";
import {updateHandDisplay} from "../display/updateHandDisplay.js";
import {generateGuid} from "../utils/generateGuid.js";
import {customAlert} from "../utils/customAlert.js";
import {getSuitSymbol} from "../cards/getSuitSymbol.js";

export async function playCards() {
    if (selectedCards.length === 0) {
        await customAlert('Please select cards to play');
        return;
    }

    // Additional validation - if only 1 active player remains, they can only challenge
    if (gameState && gameState.players) {
        const activePlayers = gameState.players.filter(p => p.handCount > 0);
        const playersWithNoCards = gameState.players.filter(p => p.handCount === 0);
        
        if (activePlayers.length === 1 && playersWithNoCards.length > 0) {
            // Format player names with HTML styling
            const finishedPlayerNames = playersWithNoCards
                .map(p => `<span style="font-weight: bold; font-style: italic;">${p.name}</span>`)
                .join(', ');
            
            await customAlert(
                `You cannot play more cards! ${finishedPlayerNames} finished the round. You can only challenge now.`,
                'Cannot Play Cards'
            );
            
            // Clear selected cards and update display
            setSelectedCards([]);
            updateHandDisplay();
            updateActionsDisplay();
            return;
        }
    }

    // Get the actual card objects from sorted display
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

    const cardsToPlay = selectedCards.map(index => sortedHand[index]);
    let declaredRank = gameState.announcedRank;

    // If opening turn, get declared rank and validate
    if (!gameState.announcedRank) {
        declaredRank = document.getElementById('declaredRank').value;

        if (!declaredRank || declaredRank === '') {
            await customAlert('Please choose a rank from the dropdown before playing cards.');
            return;
        }
    }

    // Create and store the "You played in order" message
    const cardNames = cardsToPlay.map(card => {
        if (card.rank === 'Joker') {
            return 'Joker';
        } else {
            const suitSymbol = getSuitSymbol(card.suit);
            return `${card.rank}${suitSymbol}`;
        }
    });

    window.lastPlayedMessage = `<span style="color: #007bff; font-weight: bold;">You played in order: ${cardNames.join(' → ')} (${cardsToPlay.length} card${cardsToPlay.length === 1 ? '' : 's'})</span>`;

    console.log("Playing cards:", cardsToPlay.map(c => `${c.rank} of ${c.suit}`));

    try {
        await connection.invoke("SubmitMove", {
            matchId: gameState.matchId,
            clientCmdId: generateGuid(),
            playerId: playerId,
            action: 0, // Play
            cards: cardsToPlay,
            declaredRank: declaredRank
        });

        // Clear selected cards and interaction state after successful play
        setSelectedCards([]);
        window.playerInteractionState = false;

        console.log("Selected cards cleared after play, interaction state cleared");

        // Update displays
        updateHandDisplay();
        updateActionsDisplay();
    } catch (err) {
        console.error("Failed to play cards:", err);
        await customAlert("Failed to play cards: " + err, 'Play Failed');

        // Clear stored message if play failed
        window.lastPlayedMessage = null;
        updateActionsDisplay();
    }
}