function showEventHistory() {
    const messageArea = document.getElementById('messageArea');
    
    if (!window.gameEventHistory || window.gameEventHistory.length === 0) {
        messageArea.innerHTML = 'Welcome to Believe Or Not! Wait for other players to join.';
        return;
    }
    
    messageArea.innerHTML = window.gameEventHistory
        .map(event => `<div style="margin: 2px 0; font-size: 0.9em;">${event}</div>`)
        .join('');
}