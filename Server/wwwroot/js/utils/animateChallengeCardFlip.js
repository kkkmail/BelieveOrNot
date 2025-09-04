// js/utils/animateChallengeCardFlip.js
import { CONFIG } from "./config.js";
import { getSuitSymbol } from "../cards/getSuitSymbol.js";
import { getSuitClass } from "../cards/getSuitClass.js";

export function animateChallengeCardFlip(cardElement, revealedCard, announcedRank, isMatch) {
    return new Promise((resolve) => {
        console.log("Starting challenge card flip animation", {
            revealedCard,
            announcedRank,
            isMatch,
            cardElement: cardElement
        });

        if (!cardElement) {
            console.error("No card element provided for animation");
            resolve();
            return;
        }

        // Store original content
        const originalContent = cardElement.innerHTML;
        const originalClasses = cardElement.className;
        
        console.log("Original card content:", originalContent);
        console.log("Original card classes:", originalClasses);
        
        // Add flip animation styles if not already present
        if (!document.getElementById('challenge-flip-styles')) {
            const style = document.createElement('style');
            style.id = 'challenge-flip-styles';
            style.textContent = `
                .challenge-card-flipping {
                    transform-style: preserve-3d !important;
                    transition: transform ${CONFIG.CHALLENGE_CARD_FLIP_DURATION}ms ${CONFIG.FLIP_ANIMATION_EASING} !important;
                    position: relative !important;
                }
                
                .challenge-card-flipped {
                    transform: rotateY(180deg) !important;
                }
                
                .challenge-card-front,
                .challenge-card-back {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    backface-visibility: hidden !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: inherit !important;
                    border: inherit !important;
                }
                
                .challenge-card-back {
                    transform: rotateY(180deg) !important;
                }
                
                .challenge-result-overlay {
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    font-size: 48px !important;
                    font-weight: bold !important;
                    opacity: 0 !important;
                    transition: opacity ${CONFIG.CHALLENGE_RESULT_FADE_DURATION}ms ease !important;
                    z-index: 10 !important;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5) !important;
                    pointer-events: none !important;
                }
                
                .challenge-result-overlay.success {
                    color: #28a745 !important;
                }
                
                .challenge-result-overlay.fail {
                    color: #dc3545 !important;
                }
                
                .challenge-result-overlay.visible {
                    opacity: 1 !important;
                }
            `;
            document.head.appendChild(style);
            console.log("Added challenge flip styles to document");
        }

        // Prepare the card for 3D flip
        cardElement.style.position = 'relative';
        cardElement.style.transformStyle = 'preserve-3d';
        cardElement.classList.add('challenge-card-flipping');
        
        // Create front and back faces
        const frontFace = document.createElement('div');
        frontFace.className = 'challenge-card-front';
        frontFace.innerHTML = originalContent;
        
        const backFace = document.createElement('div');
        backFace.className = `challenge-card-back ${getSuitClass(revealedCard.suit)}`;
        
        // Set up revealed card content
        if (revealedCard.rank === 'Joker') {
            backFace.innerHTML = `
                <div class="rank">🃏</div>
                <div class="suit">JOKER</div>
            `;
        } else {
            backFace.innerHTML = `
                <div class="rank">${revealedCard.rank}</div>
                <div class="suit">${getSuitSymbol(revealedCard.suit)}</div>
            `;
        }
        
        // Create result overlay
        const resultOverlay = document.createElement('div');
        resultOverlay.className = `challenge-result-overlay ${isMatch ? 'success' : 'fail'}`;
        resultOverlay.textContent = isMatch ? CONFIG.CHALLENGE_SUCCESS_SYMBOL : CONFIG.CHALLENGE_FAIL_SYMBOL;
        
        console.log("Created animation elements:", {
            frontFace: frontFace,
            backFace: backFace, 
            resultOverlay: resultOverlay
        });
        
        // Clear card and add 3D structure
        cardElement.innerHTML = '';
        cardElement.appendChild(frontFace);
        cardElement.appendChild(backFace);
        cardElement.appendChild(resultOverlay);
        
        console.log("Added 3D structure to card element");
        
        // Force a reflow to ensure the DOM is ready
        cardElement.offsetHeight;
        
        // Start the flip animation
        setTimeout(() => {
            console.log("Starting flip animation");
            cardElement.classList.add('challenge-card-flipped');
        }, 50);
        
        // Show result symbol after flip completes
        setTimeout(() => {
            console.log("Showing result symbol:", isMatch ? 'SUCCESS' : 'FAIL');
            resultOverlay.classList.add('visible');
        }, CONFIG.CHALLENGE_CARD_FLIP_DURATION + 200);
        
        // Clean up and resolve after display duration
        setTimeout(() => {
            console.log("Starting cleanup");
            // Fade out result overlay
            resultOverlay.classList.remove('visible');
            
            setTimeout(() => {
                console.log("Final cleanup and restore");
                // Clean up animation classes and restore normal state
                cardElement.classList.remove('challenge-card-flipping', 'challenge-card-flipped');
                cardElement.style.position = '';
                cardElement.style.transformStyle = '';
                cardElement.innerHTML = originalContent;
                cardElement.className = originalClasses;
                
                console.log("Challenge card animation completed");
                resolve();
            }, CONFIG.CHALLENGE_RESULT_FADE_DURATION);
            
        }, CONFIG.CHALLENGE_CARD_DISPLAY_DURATION);
    });
}