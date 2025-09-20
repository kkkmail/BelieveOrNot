// Server/wwwroot/king/js/utils/initializeSetupForm.js
import { getMatchIdFromUrl } from "../../../js/utils/urlManager.js";
import { getStoredPlayerName } from "../../../js/utils/playerIdUtils.js";

export function initializeSetupForm() {
    // Check if there's a match ID in the URL and pre-fill it
    const matchIdFromUrl = getMatchIdFromUrl();
    const matchIdInput = document.getElementById('matchId');
    const playerNameInput = document.getElementById('playerName');
    const urlInfo = document.getElementById('urlInfo');

    // Prefill player name from cookie
    const storedPlayerName = getStoredPlayerName();
    if (storedPlayerName && playerNameInput && !playerNameInput.value) {
        playerNameInput.value = storedPlayerName;
        console.log('Pre-filled King player name from cookie:', storedPlayerName);
    }

    if (matchIdFromUrl && matchIdInput) {
        matchIdInput.value = matchIdFromUrl;
        console.log('Pre-filled King match ID from URL:', matchIdFromUrl);

        // Show the URL info tip
        if (urlInfo) {
            urlInfo.style.display = 'block';
        }

        // Focus on the player name field since match ID is already filled
        if (playerNameInput) {
            setTimeout(() => {
                playerNameInput.focus();
            }, 100);
        }
    } else {
        // No match ID in URL, focus on player name if it's empty
        if (playerNameInput && !playerNameInput.value) {
            setTimeout(() => {
                playerNameInput.focus();
            }, 100);
        }
    }
}
