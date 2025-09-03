// Load HTML content from external files
export async function loadHtmlContent() {
    try {
        // Load setup form
        const setupResponse = await fetch('setup-form.html');
        const setupHtml = await setupResponse.text();
        document.getElementById('gameSetup').innerHTML = setupHtml;

        // Load game board
        const boardResponse = await fetch('game-board.html');
        const boardHtml = await boardResponse.text();
        document.getElementById('gameBoard').innerHTML = boardHtml;

        console.log('HTML content loaded successfully');
    } catch (error) {
        console.error('Failed to load HTML content:', error);
        // Fallback: show error message
        document.getElementById('gameSetup').innerHTML = '<div style="color: red; text-align: center;">Failed to load game content. Please refresh the page.</div>';
    }
}
