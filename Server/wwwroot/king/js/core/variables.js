// Server/wwwroot/king/js/core/variables.js

// Global game state
export let connection = null;
export let gameState = null;
export let currentMatch = null;
export let playerId = null;
export let clientId = null;
export let selectedCard = null; // Single card selection for King game
export let selectedTrumpSuit = null;

// Setters for state management
export function setConnection(newConnection) {
    connection = newConnection;
}

export function setGameState(newState) {
    gameState = newState;
    console.log("Game state updated:", gameState);
}

export function setCurrentMatch(newMatch) {
    currentMatch = newMatch;
}

export function setPlayerId(newPlayerId) {
    playerId = newPlayerId;
}

export function setClientId(newClientId) {
    clientId = newClientId;
}

export function setSelectedCard(cardIndex) {
    selectedCard = cardIndex;
    console.log("Selected card updated:", selectedCard);
}

export function setSelectedTrumpSuit(suit) {
    selectedTrumpSuit = suit;
}