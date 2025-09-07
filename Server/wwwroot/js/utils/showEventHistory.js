// js/utils/showEventHistory.js
export function showEventHistory() {
    const messageArea = document.getElementById('messageArea');

    if (!messageArea) {
        console.error("Message area not found");
        return;
    }

    if (!window.gameEventHistory || window.gameEventHistory.length === 0) {
        // Initialize with welcome message
        window.gameEventHistory = [`${new Date().toLocaleTimeString()}: Welcome to Believe Or Not! Wait for other players to join.`];
    }

    // Show events in reverse chronological order (newest first at top)
    const eventsHtml = window.gameEventHistory
        .slice() // Create copy to avoid modifying original
        .reverse() // Newest messages at top
        .map(event => `<div style="margin: 3px 0; padding: 4px 0; font-size: 0.9em; line-height: 1.3; border-bottom: 1px solid rgba(0,0,0,0.05);">${event}</div>`)
        .join('');

    messageArea.innerHTML = eventsHtml;

    // Keep scroll at top to show newest events
    messageArea.scrollTop = 0;

    console.log("Updated event history display with", window.gameEventHistory.length, "events (newest at top)");
}
