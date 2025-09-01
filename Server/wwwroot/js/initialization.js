// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM loaded, starting initialization...");
    
    // First load the HTML content
    await loadHtmlContent();
    
    // Set up event listeners for buttons
    setupEventListeners();
    
    // Then initialize the connection
    await initializeConnection();
    
    console.log("Application initialized successfully");
});