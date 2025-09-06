// js/utils/urlManager.js
export function setMatchIdInUrl(matchId) {
    const url = new URL(window.location);
    url.searchParams.set('match', matchId);
    url.searchParams.set('game', 'king');
    window.history.replaceState({}, '', url);
    console.log('King match ID set in URL:', matchId);
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
    url.searchParams.delete('game');
    window.history.replaceState({}, '', url);
    console.log('Match ID cleared from URL');
}