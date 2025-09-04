// js/utils/config.js
// Configuration constants for the game

export const CONFIG = {
    // Challenge card animation timings
    CHALLENGE_CARD_FLIP_DURATION: 600, // milliseconds for flip animation
    CHALLENGE_CARD_DISPLAY_DURATION: 3000, // 3 seconds to show result
    CHALLENGE_RESULT_FADE_DURATION: 300, // milliseconds for fade out
    
    // Challenge result symbols
    CHALLENGE_SUCCESS_SYMBOL: '✓', // Card matches announced rank
    CHALLENGE_FAIL_SYMBOL: '✗', // Card does not match announced rank
    
    // Animation easing
    FLIP_ANIMATION_EASING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
};