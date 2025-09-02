// Consistent time formatting function - use 24-hour format
function formatTime(date = new Date()) {
    return date.toLocaleTimeString('en-US', {
        hour12: false, // Use 24-hour format
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Get current formatted time
function getCurrentTime() {
    return formatTime(new Date());
}