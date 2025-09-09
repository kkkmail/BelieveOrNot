// Server/wwwroot/king/js/utils/showHelpModal.js
import { showHtmlModal } from "../../../js/utils/showHtmlModal.js";

export async function showHelpModal() {
    await showHtmlModal({
        name: 'king-help',
        htmlFile: '/king/help.html',
        contentSelector: '.help-container',
        backButtonSelector: '.back-button',
        modalId: 'kingHelpModal',
        title: '👑 The King - Game Rules',
        maxWidth: '900px',
        maxHeight: '90vh',
        bodyStyle: 'padding: 30px; overflow-y: auto;'
    });
}