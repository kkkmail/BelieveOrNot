// js/utils/showOtherGamesModal.js
import { showHtmlModal } from "./showHtmlModal.js";

export async function showOtherGamesModal() {
    await showHtmlModal({
        name: 'other games',
        htmlFile: 'other-games.html',
        contentSelector: '.coming-soon-container',
        backButtonSelector: '.coming-soon-back-button',
        modalId: 'otherGamesModal',
        title: '🎮 Other Games',
        maxWidth: '700px',
        maxHeight: '80vh',
        bodyStyle: 'padding: 50px 30px; text-align: center;'
    });
}