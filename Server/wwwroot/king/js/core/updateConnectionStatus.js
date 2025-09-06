// js/core/updateConnectionStatus.js
export function updateConnectionStatus(status) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        statusElement.className = `connection-status ${status}`;
        statusElement.textContent = status === 'connected' ? 'Connected' : 'Disconnected';
    }
}