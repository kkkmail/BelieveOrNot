// Server/wwwroot/king/js/utils/loadHtmlContent.js
export async function loadHtmlContent() {
    try {
        // Load King setup form from correct path
        const setupResponse = await fetch('/king/setup-form.html');
        const setupHtml = await setupResponse.text();
        document.getElementById('gameSetup').innerHTML = setupHtml;

        // Load King game board from correct path
        const boardResponse = await fetch('/king/game-board.html');
        const boardHtml = await boardResponse.text();
        document.getElementById('gameBoard').innerHTML = boardHtml;

        console.log('King HTML content loaded successfully');
    } catch (error) {
        console.error('Failed to load King HTML content:', error);
        // Fallback: show error message
        document.getElementById('gameSetup').innerHTML = '<div style="color: red; text-align: center;">Failed to load King game content. Please refresh the page.</div>';
    }
}