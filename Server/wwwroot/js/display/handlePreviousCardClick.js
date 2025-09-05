import {showMessage} from "../utils/showMessage.js";
import {gameState, playerId, setSelectedChallengeIndex, selectedChallengeIndex, setSelectedCards} from "../core/variables.js";
import {updatePreviousPlayDisplay} from "./updatePreviousPlayDisplay.js";
import {updateActionsDisplay} from "./updateActionsDisplay.js";

export function handlePreviousCardClick(cardIndex) {
    console.log('Previous play card ' + (cardIndex + 1) + ' clicked');

    // Check if we can challenge
    if (!gameState || gameState.phase !== 1) {
        console.log("Cannot challenge: game not in progress");
        showMessage("Cannot challenge: game not in progress", 3000, false);
        return;
    }

    if (!gameState.tablePileCount || gameState.tablePileCount === 0) {
        console.log("Cannot challenge: no cards on table");
        showMessage("Cannot challenge: no cards on table", 3000, false);
        return;
    }

    if (!gameState.announcedRank) {
        console.log("Cannot challenge: no announced rank");
        showMessage("Cannot challenge: no announced rank", 3000, false);
        return;
    }

    // Challenge logic - can challenge when it's our turn OR 2-player special case
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isMyTurn = currentPlayer && currentPlayer.id === playerId;

    // Special 2-player rule
    const playersWithNoCards = gameState.players.filter(p => p.handCount === 0);
    const is2PlayerWithZeroCards = gameState.players.length === 2 && playersWithNoCards.length > 0;

    const canChallenge = isMyTurn || is2PlayerWithZeroCards;

    console.log("Challenge check:", {
        isMyTurn,
        is2PlayerWithZeroCards,
        canChallenge,
        currentPlayerName: currentPlayer?.name,
        myPlayerId: playerId
    });

    if (!canChallenge) {
        console.log("Cannot challenge: not the right conditions");
        showMessage("You can only challenge when it's your turn!", 3000, false);
        return;
    }

    // Clear any selected cards since we're switching to challenge mode
    setSelectedCards([]);

    // Set interaction state and clear stored message when starting challenge
    window.playerInteractionState = true;
    window.lastPlayedMessage = null;

    // Toggle selection
    if (selectedChallengeIndex === cardIndex) {
        // Deselect
        setSelectedChallengeIndex(-1);
        // Clear interaction state when deselecting
        window.playerInteractionState = false;
        console.log('Challenge card deselected');
    } else {
        // Select this card
        setSelectedChallengeIndex(cardIndex);
        console.log('Challenge card selected:', cardIndex + 1);
    }

    // Update displays
    updatePreviousPlayDisplay();
    updateActionsDisplay();
}