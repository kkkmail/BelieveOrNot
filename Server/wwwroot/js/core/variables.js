// js/core/variables.js

export let connection = null;
export function setConnection(v) { connection = v; }

export let gameState = null;
export function setGameState(v) { gameState = v; }

export let currentMatch = null;
export function setCurrentMatch(v) { currentMatch = v; }

export let selectedCards = [];
export function setSelectedCards(v) { selectedCards = v; }

export let selectedChallengeIndex = -1;
export function setSelectedChallengeIndex(v) { 
    selectedChallengeIndex = v; 
    console.log("selectedChallengeIndex updated to:", selectedChallengeIndex);
}

export let playerId = null;
export function setPlayerId(v) { playerId = v; }

export let clientId = null; // NEW: Persistent client ID
export function setClientId(v) { clientId = v; }