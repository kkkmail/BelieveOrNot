// js/utils/clientIdUtils.js
export function generateClientId() {
    return 'king_client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export function getOrCreateClientId() {
    let clientId = getCookie('kingClientId');
    
    if (!clientId) {
        clientId = generateClientId();
        setCookie('kingClientId', clientId, 365);
        console.log('Created new King client ID:', clientId);
    } else {
        console.log('Retrieved existing King client ID:', clientId);
    }
    
    return clientId;
}

export function getStoredPlayerName() {
    return getCookie('kingPlayerName');
}

export function storePlayerName(playerName) {
    if (playerName && playerName.trim()) {
        setCookie('kingPlayerName', playerName.trim(), 365);
        console.log('Stored King player name:', playerName.trim());
    }
}

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

export function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}