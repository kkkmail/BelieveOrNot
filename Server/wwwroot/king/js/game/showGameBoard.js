// js/game/showGameBoard.js
export function showGameBoard() {
    const gameSetup = document.getElementById('gameSetup');
    const gameBoard = document.getElementById('gameBoard');
    
    if (gameSetup) {
        gameSetup.style.display = 'none';
    }
    
    if (gameBoard) {
        gameBoard.style.display = 'block';
    }
    
    console.log('King game board displayed');
}