// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM loaded, starting initialization...");
    
    // First load the HTML content
    await loadHtmlContent();
    
    // Set up initial event listeners (setup form)
    setupEventListeners();
    
    // Set up game board event listeners after HTML is loaded
    setupGameBoardEventListeners();
    
    // Then initialize the connection
    await initializeConnection();
    
    console.log("Application initialized successfully");
});