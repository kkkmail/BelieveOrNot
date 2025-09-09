// js/utils/gameRouter.js
// Handle routing between different games based on match ID

export function getGameTypeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('game');
}

export function getMatchIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('match');
}

export async function routeToCorrectGame(matchId) {
    if (!matchId) {
        console.log('No match ID provided for routing');
        return false;
    }

    console.log('Attempting to route match ID:', matchId);

    // Try to determine game type from current URL first
    const gameType = getGameTypeFromUrl();
    if (gameType) {
        console.log('Game type specified in URL:', gameType);
        return false; // Let the specific game handle it
    }

    try {
        // Check which game this match belongs to by trying both endpoints
        const [believeResponse, kingResponse] = await Promise.allSettled([
            fetch('/game/check-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId })
            }),
            fetch('/king/check-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId })
            })
        ]);

        // Check BelieveOrNot first
        if (believeResponse.status === 'fulfilled' && believeResponse.value.ok) {
            const result = await believeResponse.value.json();
            if (result.exists) {
                console.log('Match found in BelieveOrNot, staying on current page');
                // If we're not already on the main page, redirect there
                if (window.location.pathname !== '/') {
                    window.location.href = `/?match=${matchId}`;
                    return true;
                }
                return false; // Stay on current page
            }
        }

        // Check King game
        if (kingResponse.status === 'fulfilled' && kingResponse.value.ok) {
            const result = await kingResponse.value.json();
            if (result.exists) {
                console.log('Match found in King, redirecting to unified page...');
                window.location.href = `/?game=king&match=${matchId}`;
                return true;
            }
        }

        console.log('Match not found in any game');
        return false;
    } catch (error) {
        console.error('Error checking match routing:', error);
        return false;
    }
}

export function setGameInUrl(gameType) {
    const url = new URL(window.location);
    if (gameType) {
        url.searchParams.set('game', gameType);
    } else {
        url.searchParams.delete('game');
    }
    window.history.replaceState({}, '', url);
}

export function setMatchIdInUrl(matchId) {
    const url = new URL(window.location);
    url.searchParams.set('match', matchId);
    window.history.replaceState({}, '', url);
    console.log('Match ID set in URL:', matchId);
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