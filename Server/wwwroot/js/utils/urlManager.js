// js/utils/urlManager.js
// URL management for match IDs

export function setMatchIdInUrl(matchId) {
    const url = new URL(window.location);
    url.searchParams.set('match', matchId);
    window.history.replaceState({}, '', url);
    console.log('Match ID set in URL:', matchId);
}

export function getMatchIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('match');
    console.log('Match ID from URL:', matchId);
    return matchId;
}

export function clearMatchIdFromUrl() {
    const url = new URL(window.location);
    url.searchParams.delete('match');
    window.history.replaceState({}, '', url);
    console.log('Match ID cleared from URL');
}

export function generateShareableUrl(matchId) {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('match', matchId);
    return url.toString();
}