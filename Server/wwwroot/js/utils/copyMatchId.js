// js/utils/copyMatchId.js
import {showMessage} from "./showMessage.js";

export async function copyMatchId() {
    const matchIdInput = document.getElementById('displayMatchId');
    const copyBtn = document.getElementById('copyMatchIdBtn');

    if (!matchIdInput || !matchIdInput.value) {
        alert('No match ID to copy');
        return;
    }

    try {
        // Try using the modern Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(matchIdInput.value);
        } else {
            // Fallback for older browsers or non-HTTPS contexts
            matchIdInput.select();
            matchIdInput.setSelectionRange(0, 99999); // For mobile devices
            document.execCommand('copy');

            // Clear selection
            window.getSelection().removeAllRanges();
        }

        // Provide visual feedback
        const originalText = copyBtn.textContent;
        const originalTitle = copyBtn.title;

        copyBtn.textContent = '✓';
        copyBtn.title = 'Copied!';
        copyBtn.style.background = '#28a745';

        // Show temporary message
        showMessage(`Match ID copied to clipboard: ${matchIdInput.value}`, 3000, false);

        // Reset button after 2 seconds
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.title = originalTitle;
            copyBtn.style.background = '#17a2b8';
        }, 2000);

        console.log('Match ID copied to clipboard:', matchIdInput.value);
    } catch (err) {
        console.error('Failed to copy match ID:', err);

        // Fallback: select the text so user can manually copy
        matchIdInput.select();
        matchIdInput.setSelectionRange(0, 99999);

        alert('Please manually copy the selected Match ID (Ctrl+C or Cmd+C)');
    }
}
