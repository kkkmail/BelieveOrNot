// js/utils/config.js
// Configuration constants for the game

export const CONFIG = {
    // Challenge card animation timings
    CHALLENGE_CARD_FLIP_DURATION: 600, // milliseconds for flip animation
    CHALLENGE_CARD_DISPLAY_DURATION: 5000, // 5 seconds to show result (for challenger)
    CHALLENGE_CARD_DISPLAY_DURATION_NON_CHALLENGER: 3000, // 3 seconds for non-challenger (shorter)
    CHALLENGE_CARD_EXTRA_TIME: 2000, // 2 additional seconds for visibility (for challenger)
    CHALLENGE_CARD_EXTRA_TIME_NON_CHALLENGER: 1000, // 1 seconds for non-challenger (much shorter)
    CHALLENGE_CARD_REVEAL_DELAY: 800, // delay before showing success/fail symbol
    CHALLENGE_RESULT_FADE_DURATION: 300, // milliseconds for fade out

    // Challenge result symbols
    CHALLENGE_SUCCESS_SYMBOL: '✓', // Card matches announced rank
    CHALLENGE_FAIL_SYMBOL: '✗', // Card does not match announced rank

    // Animation easing
    FLIP_ANIMATION_EASING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

    // Cleanup delays after animation
    CHALLENGE_CLEANUP_DELAY_CHALLENGER: 200, // ms to wait before clearing selection for challenger
    CHALLENGE_CLEANUP_DELAY_NON_CHALLENGER: 200, // ms to wait before clearing selection for non-challenger

    // UI message formatting
    MESSAGE_SEPARATOR: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', // 6 non-breaking spaces for message part separation
};