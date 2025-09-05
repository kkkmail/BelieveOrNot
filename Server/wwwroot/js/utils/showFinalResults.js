// js/utils/showFinalResults.js
import {clearMatchIdFromUrl} from "./urlManager.js";
import {newGame} from "../actions/newGame.js";

export function showFinalResults(results) {
    console.log("Showing final results:", results);
    
    // Create results overlay
    const overlay = document.createElement('div');
    overlay.id = 'finalResultsOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const resultsPanel = document.createElement('div');
    resultsPanel.style.cssText = `
        background: white;
        border-radius: 15px;
        box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        transform: scale(0.7);
        transition: transform 0.3s ease;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 15px 15px 0 0;
        text-align: center;
    `;
    
    header.innerHTML = `
        <h2 style="margin: 0; font-size: 24px; display: flex; align-items: center; justify-content: center;">
            <span style="margin-right: 12px;">🏁</span>
            Game Results
        </h2>
    `;
    
    const body = document.createElement('div');
    body.style.cssText = `padding: 25px;`;
    
    // Winner announcement
    const winnerSection = document.createElement('div');
    winnerSection.style.cssText = `
        text-align: center;
        margin-bottom: 25px;
        padding: 20px;
        background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
        border-radius: 10px;
        border: 3px solid #f39c12;
    `;
    
    winnerSection.innerHTML = `
        <div style="font-size: 18px; font-weight: bold; color: #d35400; margin-bottom: 8px;">
            ${results.winnerText}
        </div>
    `;
    
    // Final scores table
    const scoresSection = document.createElement('div');
    scoresSection.innerHTML = `
        <h3 style="margin: 0 0 15px 0; text-align: center; color: #333;">Final Standings</h3>
    `;
    
    const scoresTable = document.createElement('div');
    scoresTable.style.cssText = `
        background: #f8f9fa;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #dee2e6;
    `;
    
    results.finalScores.forEach((score, index) => {
        const scoreRow = document.createElement('div');
        scoreRow.style.cssText = `
            padding: 12px 16px;
            border-bottom: ${index < results.finalScores.length - 1 ? '1px solid #dee2e6' : 'none'};
            display: flex;
            justify-content: space-between;
            align-items: center;
            ${index === 0 ? 'background: #fff3cd; font-weight: bold;' : ''}
            ${results.winners.some(winner => score.includes(winner)) ? 'background: #d4edda;' : ''}
        `;
        
        const position = score.split('.')[0];
        const nameAndScore = score.split('.').slice(1).join('.').trim();
        
        scoreRow.innerHTML = `
            <span style="color: #495057; font-size: 16px;">
                ${position === '1' ? '🥇' : position === '2' ? '🥈' : position === '3' ? '🥉' : ''}
                ${nameAndScore}
            </span>
        `;
        
        scoresTable.appendChild(scoreRow);
    });
    
    scoresSection.appendChild(scoresTable);
    
    // Buttons section
    const buttonsSection = document.createElement('div');
    buttonsSection.style.cssText = `
        margin-top: 25px;
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
    `;
    
    // NEW: Start New Game button (available to all players)
    const newGameButton = document.createElement('button');
    newGameButton.style.cssText = `
        background: #28a745;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: background 0.2s;
        flex: 1;
        min-width: 140px;
        max-width: 180px;
    `;
    newGameButton.textContent = '🎮 Start New Game';
    newGameButton.addEventListener('click', () => {
        closeResults();
        newGame(); // Use the newGame function which handles name prefilling
    });
    
    // Copy Results button
    const copyButton = document.createElement('button');
    copyButton.style.cssText = `
        background: #17a2b8;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
        flex: 1;
        min-width: 120px;
        max-width: 160px;
    `;
    copyButton.textContent = '📋 Copy Results';
    copyButton.addEventListener('click', () => copyResults(results));
    
    // Close button  
    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
        background: #6c757d;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
        flex: 1;
        min-width: 80px;
        max-width: 120px;
    `;
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => closeResults());
    
    buttonsSection.appendChild(newGameButton);
    buttonsSection.appendChild(copyButton);
    buttonsSection.appendChild(closeButton);
    
    // Assemble the panel
    body.appendChild(winnerSection);
    body.appendChild(scoresSection);
    body.appendChild(buttonsSection);
    
    resultsPanel.appendChild(header);
    resultsPanel.appendChild(body);
    overlay.appendChild(resultsPanel);
    
    // Add to page with animation
    document.body.appendChild(overlay);
    
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        resultsPanel.style.transform = 'scale(1)';
    });
    
    // Handle ESC key
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            document.removeEventListener('keydown', handleEsc);
            closeResults();
        }
    };
    document.addEventListener('keydown', handleEsc);
    
    // Internal functions
    function closeResults() {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 300);
    }
}

function copyResults(results) {
    const resultText = [
        '🏁 Game Results - Believe Or Not',
        '',
        results.winnerText,
        '',
        'Final Standings:',
        ...results.finalScores,
        '',
        `Game completed at ${new Date().toLocaleString()}`
    ].join('\n');
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(resultText).then(() => {
            alert('Results copied to clipboard!');
        }).catch(() => {
            fallbackCopy(resultText);
        });
    } else {
        fallbackCopy(resultText);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert('Results copied to clipboard!');
    } catch (err) {
        alert('Please manually copy the results from the dialog');
    }
    document.body.removeChild(textArea);
}