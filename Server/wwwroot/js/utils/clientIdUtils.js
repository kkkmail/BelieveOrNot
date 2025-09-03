// js/utils/clientIdUtils.js
// Persistent client ID management using cookies

export function generateClientId() {
    return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export function getOrCreateClientId() {
    let clientId = getCookie('believeOrNotClientId');
    
    if (!clientId) {
        clientId = generateClientId();
        setCookie('believeOrNotClientId', clientId, 365); // 1 year expiry
        console.log('Created new client ID:', clientId);
    } else {
        console.log('Retrieved existing client ID:', clientId);
    }
    
    return clientId;
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

export function clearClientId() {
    document.cookie = 'believeOrNotClientId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('Client ID cleared');
}