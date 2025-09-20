// js/utils/initializeSetupForm.js
import { getMatchIdFromUrl } from "./urlManager.js";
import { getStoredPlayerName } from "./playerIdUtils.js";

export function initializeSetupForm() {
    // Check if there's a match ID in the URL and pre-fill it
    const matchIdFromUrl = getMatchIdFromUrl();
    const matchIdInput = document.getElementById('matchId');
    const playerNameInput = document.getElementById('playerName');
    const urlInfo = document.getElementById('urlInfo');

    // Prefill player name from cookie (much more reliable than localStorage)
    const storedPlayerName = getStoredPlayerName();
    if (storedPlayerName && playerNameInput && !playerNameInput.value) {
        playerNameInput.value = storedPlayerName;
        console.log('Pre-filled player name from cookie:', storedPlayerName);
    }

    if (matchIdFromUrl && matchIdInput) {
        matchIdInput.value = matchIdFromUrl;
        console.log('Pre-filled match ID from URL:', matchIdFromUrl);

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

    // Add copy URL button functionality if match ID is present
    if (matchIdFromUrl) {
        addShareUrlFeature();
    }
}

function addShareUrlFeature() {
    const matchIdInput = document.getElementById('matchId');
    if (!matchIdInput || !matchIdInput.value) return;

    // Create share button
    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'btn-copy';
    shareBtn.innerHTML = '🔗';
    shareBtn.title = 'Copy shareable URL';
    shareBtn.style.cssText = `
        margin-left: 8px;
        padding: 8px;
        font-size: 16px;
    `;

    shareBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const currentUrl = window.location.href;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(currentUrl);
            } else {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = currentUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            // Visual feedback
            const original = shareBtn.innerHTML;
            shareBtn.innerHTML = '✓';
            shareBtn.style.background = '#28a745';

            setTimeout(() => {
                shareBtn.innerHTML = original;
                shareBtn.style.background = '#17a2b8';
            }, 2000);

        } catch (err) {
            console.error('Failed to copy URL:', err);
            alert('Failed to copy URL. Please copy it from your browser\'s address bar.');
        }
    });

    // Insert the share button after the match ID input
    const formGroup = matchIdInput.parentElement;
    formGroup.style.display = 'flex';
    formGroup.style.alignItems = 'flex-end';
    formGroup.style.flexDirection = 'column';

    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.width = '100%';
    inputContainer.style.alignItems = 'center';

    matchIdInput.parentNode.insertBefore(inputContainer, matchIdInput);
    inputContainer.appendChild(matchIdInput);
    inputContainer.appendChild(shareBtn);
}
