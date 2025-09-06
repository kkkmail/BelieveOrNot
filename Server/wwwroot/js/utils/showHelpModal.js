// js/utils/showHelpModal.js
import { showHtmlModal } from "./showHtmlModal.js";

export async function showHelpModal() {
    await showHtmlModal({
        name: 'help',
        htmlFile: 'help.html',
        contentSelector: '.help-container',
        backButtonSelector: '.back-button',
        modalId: 'helpModal',
        title: '🎴 How to Play Believe Or Not',
        maxWidth: '900px',
        maxHeight: '90vh',
        bodyStyle: 'padding: 30px; overflow-y: auto;'
    });
}