// js/utils/addToGameLog.js
// Reuse the BelieveOrNot showMessage functionality but adapt for King's log area
export function addToGameLog(message) {
    const logMessages = document.getElementById('logMessages');
    if (!logMessages) return;

    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });

    const logEntry = document.createElement('div');
    logEntry.style.cssText = 'margin: 3px 0; padding: 4px 0; font-size: 0.9em; line-height: 1.3; border-bottom: 1px solid rgba(0,0,0,0.05);';
    logEntry.innerHTML = `${timestamp}: ${message}`;

    logMessages.insertBefore(logEntry, logMessages.firstChild);

    // Keep only last 10 messages
    while (logMessages.children.length > 10) {
        logMessages.removeChild(logMessages.lastChild);
    }
}