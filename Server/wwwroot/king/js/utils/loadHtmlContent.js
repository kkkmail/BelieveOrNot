// Server/wwwroot/king/js/utils/loadHtmlContent.js
export async function loadHtmlContent() {
    try {
        console.log("Loading King HTML content...");

        // Load King setup form from correct path
        const setupResponse = await fetch('/king/setup-form.html');
        const setupHtml = await setupResponse.text();
        document.getElementById('gameSetup').innerHTML = setupHtml;
        console.log("King setup form loaded");

        // Load King game board from correct path
        const boardResponse = await fetch('/king/game-board.html');
        const boardHtml = await boardResponse.text();
        document.getElementById('gameBoard').innerHTML = boardHtml;
        console.log("King game board loaded");

        // CRITICAL: Load King's game-management-controls and CSS from king.html
        const kingMainResponse = await fetch('/king/king.html');
        const kingMainHtml = await kingMainResponse.text();
        
        // Extract the game-management-controls section from king.html
        const parser = new DOMParser();
        const kingDoc = parser.parseFromString(kingMainHtml, 'text/html');
        const kingGameManagement = kingDoc.querySelector('.game-management-controls');
        
        if (kingGameManagement) {
            // Replace the existing game-management-controls with King's version
            const existingGameManagement = document.querySelector('.game-management-controls');
            if (existingGameManagement) {
                existingGameManagement.innerHTML = kingGameManagement.innerHTML;
                console.log("✅ Replaced BelieveOrNot game management controls with King controls");
                
                // Debug: Log what buttons are now available
                const buttons = existingGameManagement.querySelectorAll('button');
                console.log("King buttons now available:");
                buttons.forEach(btn => {
                    console.log(`- ${btn.id}: "${btn.textContent}" (classes: ${btn.className})`);
                });
            } else {
                console.error("❌ Could not find existing game-management-controls to replace");
            }
        } else {
            console.error("❌ Could not find game-management-controls in king.html");
        }

        // CRITICAL: Extract and inject King-specific CSS for disabled cards
        const kingStyleElement = kingDoc.querySelector('style');
        if (kingStyleElement && kingStyleElement.textContent.includes('.hand-card.disabled')) {
            // Check if King styles are already injected
            const existingKingStyles = document.getElementById('king-dynamic-styles');
            if (!existingKingStyles) {
                const newStyleElement = document.createElement('style');
                newStyleElement.id = 'king-dynamic-styles';
                newStyleElement.textContent = kingStyleElement.textContent;
                document.head.appendChild(newStyleElement);
                console.log("✅ Injected King-specific CSS for disabled cards");
            } else {
                console.log("King styles already injected");
            }
        } else {
            console.error("❌ Could not find King-specific disabled card CSS");
        }

        console.log('✅ King HTML content loaded successfully');
    } catch (error) {
        console.error('❌ Failed to load King HTML content:', error);
        // Fallback: show error message
        document.getElementById('gameSetup').innerHTML = '<div style="color: red; text-align: center;">Failed to load King game content. Please refresh the page.</div>';
    }
}