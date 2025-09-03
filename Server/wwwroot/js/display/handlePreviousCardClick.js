import {showChallenge} from "../actions/showChallenge.js";
import {showMessage} from "../utils/showMessage.js";
import {gameState, playerId, setSelectedChallengeIndex} from "../core/variables.js";

export function handlePreviousCardClick(cardIndex) {
    console.log('Previous play card ' + (cardIndex + 1) + ' clicked - showing challenge interface');

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

    // FIXED: This is equivalent to clicking Challenge button + selecting this card
    // 1. Set the selected challenge index
    setSelectedChallengeIndex(cardIndex);

    // 2. Show the challenge area (same as clicking Challenge button)
    showChallenge(); // This will create identical cards and show the selected one

    console.log('Challenge interface shown with card ' + (cardIndex + 1) + ' pre-selected');
}
