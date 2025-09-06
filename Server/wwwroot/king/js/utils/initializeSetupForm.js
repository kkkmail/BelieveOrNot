// js/utils/initializeSetupForm.js
import { getMatchIdFromUrl } from "./urlManager.js";
import { getStoredPlayerName } from "../../../js/utils/clientIdUtils.js"; // Reuse from BelieveOrNot

export function initializeSetupForm() {
    const matchIdFromUrl = getMatchIdFromUrl();
    const matchIdInput = document.getElementById('matchId');
    const playerNameInput = document.getElementById('playerName');
    const urlInfo = document.getElementById('urlInfo');
    
    // Prefill player name from cookie using BelieveOrNot's logic
    const storedPlayerName = getStoredPlayerName();
    if (storedPlayerName && playerNameInput && !playerNameInput.value) {
        playerNameInput.value = storedPlayerName;
        console.log('Pre-filled King player name from cookie:', storedPlayerName);
    }
    
    if (matchIdFromUrl && matchIdInput) {
        matchIdInput.value = matchIdFromUrl;
        console.log('Pre-filled match ID from URL:', matchIdFromUrl);
        
        if (urlInfo) {
            urlInfo.style.display = 'block';
        }
        
        if (playerNameInput) {
            setTimeout(() => playerNameInput.focus(), 100);
        }
    } else {
        if (playerNameInput && !playerNameInput.value) {
            setTimeout(() => playerNameInput.focus(), 100);
        }
    }
}