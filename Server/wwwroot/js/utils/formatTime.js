// Consistent time formatting function - use 24-hour format
export function formatTime(date = new Date()) {
    return date.toLocaleTimeString('en-US', {
        hour12: false, // Use 24-hour format
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
