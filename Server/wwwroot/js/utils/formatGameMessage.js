// js/utils/formatGameMessage.js

export function formatGameMessage(message, playerName = null) {
    let formattedMessage = message;
    
    if (playerName) {
        formattedMessage = `${playerName}: ${message}`;
    }
    
    return formattedMessage;
}