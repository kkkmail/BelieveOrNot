// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // First load the HTML content
    await loadHtmlContent();
    
    // Then initialize the connection
    await initializeConnection();
});