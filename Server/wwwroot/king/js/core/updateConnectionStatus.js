// js/core/updateConnectionStatus.js
export function updateConnectionStatus(status) {
    const statusElement = document.getElementById('connectionStatus');
    if (!statusElement) return;

    statusElement.classList.remove('connected', 'disconnected', 'connecting');
    statusElement.classList.add(status);

    switch (status) {
        case 'connected':
            statusElement.textContent = 'Connected';
            break;
        case 'disconnected':
            statusElement.textContent = 'Disconnected';
            break;
        case 'connecting':
            statusElement.textContent = 'Connecting...';
            break;
        default:
            statusElement.textContent = 'Unknown';
    }
}