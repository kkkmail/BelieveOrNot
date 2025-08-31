function updateTablePileDisplay() {
    const tablePileDisplay = document.getElementById('tablePileDisplay');
    
    if (!gameState.tablePileCount || gameState.tablePileCount === 0) {
        tablePileDisplay.textContent = 'No cards on table';
        return;
    }

    const lastRank = gameState.announcedRank || 'Unknown';
    tablePileDisplay.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">
            ${gameState.tablePileCount} cards (${lastRank})
        </div>
        <div style="font-size: 0.9em; color: #666;">
            Last play: ${gameState.lastPlayCount || 0} cards
        </div>
    `;
}