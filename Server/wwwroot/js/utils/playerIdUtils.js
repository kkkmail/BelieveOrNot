// js/utils/playerIdUtils.js
// Persistent player ID and player name management using cookies

import {generateGuid} from "./generateGuid.js";
// import {CONFIG} from "./config.js";

export function generatePlayerId() {
    return generateGuid();
}

export function getOrCreatePlayerId() {
    let playerId = getCookie('believeOrNotPlayerId');

    if (!playerId) {
        playerId = generatePlayerId();
        setCookie('believeOrNotPlayerId', playerId, 365); // 1 year expiry
        console.log('Created new player ID:', playerId);
    } else {
        console.log('Retrieved existing player ID:', playerId);
    }

    return playerId;
}

export function getStoredPlayerName() {
    return getCookie('believeOrNotPlayerName');
}

export function storePlayerName(playerName) {
    if (playerName && playerName.trim()) {
        setCookie('believeOrNotPlayerName', playerName.trim(), 365); // 1 year expiry
        console.log('Stored player name in cookie:', playerName.trim());
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
