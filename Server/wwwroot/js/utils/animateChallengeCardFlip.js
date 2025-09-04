// js/utils/animateChallengeCardFlip.js
import { CONFIG } from "./config.js";
import { getSuitSymbol } from "../cards/getSuitSymbol.js";
import { getSuitClass } from "../cards/getSuitClass.js";

export function animateChallengeCardFlip(cardElement, revealedCard, announcedRank, isMatch, isChallenger = false, remainingCards = null, challengeCardIndex = 0) {
    return new Promise((resolve) => {
        console.log("Starting challenge card flip animation", {
            revealedCard,
            announcedRank,
            isMatch,
            isChallenger,
            remainingCards,
            challengeCardIndex,
            cardElement: cardElement
        });

        if (!cardElement) {
            console.error("No card element provided for animation");
            resolve();
            return;
        }

        // Store original content and classes
        const originalContent = cardElement.innerHTML;
        const originalClasses = cardElement.className;
        
        // Step 1: Show a flipping animation by temporarily hiding the card
        cardElement.style.transform = 'rotateY(90deg)';
        cardElement.style.transition = `transform ${CONFIG.CHALLENGE_CARD_FLIP_DURATION / 2}ms ease`;
        
        // Step 2: After half the flip duration, change content to revealed card
        setTimeout(() => {
            // Clear current content and rebuild as revealed card
            cardElement.innerHTML = '';
            cardElement.className = `card ${getSuitClass(revealedCard.suit)}`;
            
            if (revealedCard.rank === 'Joker') {
                cardElement.classList.add('joker');
                cardElement.innerHTML = `
                    <div class="rank">🃏</div>
                    <div class="suit">JOKER</div>
                `;
            } else {
                cardElement.innerHTML = `
                    <div class="rank">${revealedCard.rank}</div>
                    <div class="suit">${getSuitSymbol(revealedCard.suit)}</div>
                `;
            }
            
            // Complete the flip to show the revealed card
            cardElement.style.transform = 'rotateY(0deg)';
            
            console.log("Card flipped to show:", revealedCard);
            
        }, CONFIG.CHALLENGE_CARD_FLIP_DURATION / 2);
        
        // Step 3: Show result overlay after card is visible
        setTimeout(() => {
            const resultOverlay = document.createElement('div');
            resultOverlay.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 48px;
                font-weight: bold;
                color: ${isMatch ? '#28a745' : '#dc3545'};
                background: transparent;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                opacity: 0;
                transition: opacity ${CONFIG.CHALLENGE_RESULT_FADE_DURATION}ms ease;
                z-index: 10;
            `;
            
            resultOverlay.textContent = isMatch ? CONFIG.CHALLENGE_SUCCESS_SYMBOL : CONFIG.CHALLENGE_FAIL_SYMBOL;
            cardElement.style.position = 'relative';
            cardElement.appendChild(resultOverlay);
            
            // Fade in the result symbol
            setTimeout(() => {
                resultOverlay.style.opacity = '1';
                console.log("Showing result symbol:", isMatch ? 'SUCCESS' : 'FAIL');
            }, 100);
            
            // If card matches (✓ shown) and this is the challenger with remaining cards, show them IMMEDIATELY
            if (isMatch && isChallenger && remainingCards && remainingCards.length > 0) {
                console.log("🎯 CHALLENGER CONDITION MET - STARTING REMAINING CARDS ANIMATION");
                console.log("isMatch:", isMatch);
                console.log("isChallenger:", isChallenger); 
                console.log("remainingCards:", remainingCards);
                console.log("remainingCards.length:", remainingCards.length);
                console.log("challengeCardIndex:", challengeCardIndex);
                
                // Find the challenge area and animate remaining cards directly
                const challengeCards = document.getElementById('challengeCards');
                console.log("challengeCards element:", challengeCards);
                
                if (challengeCards) {
                    const allCards = challengeCards.children;
                    console.log("Total cards in challenge area:", allCards.length);
                    console.log("All card elements:", Array.from(allCards));
                    
                    let remainingIndex = 0;
                    
                    for (let pos = 0; pos < allCards.length; pos++) {
                        console.log(`Checking position ${pos}:`);
                        console.log("  - challengeCardIndex:", challengeCardIndex);
                        console.log("  - Is this the challenged card?", pos === challengeCardIndex);
                        
                        if (pos === challengeCardIndex) {
                            console.log(`  - SKIPPING position ${pos} - this is the challenged card`);
                            continue; // Skip challenged card
                        }
                        
                        if (remainingIndex < remainingCards.length) {
                            const cardElement = allCards[pos];
                            const serverCard = remainingCards[remainingIndex];
                            
                            console.log(`  - ANIMATING position ${pos} with remaining card ${remainingIndex}:`, serverCard);
                            console.log("  - Card element:", cardElement);
                            console.log("  - Card element current content:", cardElement.innerHTML);
                            console.log("  - Card element current classes:", cardElement.className);
                            console.log("  - Card element position info:", {
                                offsetTop: cardElement.offsetTop,
                                offsetLeft: cardElement.offsetLeft,
                                style: cardElement.style.cssText
                            });
                            
                            const delay = remainingIndex * 400;
                            console.log(`  - Will animate after ${delay}ms delay`);
                            
                            setTimeout(() => {
                                console.log(`🎬 Starting animation for position ${pos} with card:`, serverCard);
                                animateChallengeCardFlip(cardElement, serverCard, "", false, false, null, -1);
                            }, delay);
                            
                            remainingIndex++;
                        } else {
                            console.log(`  - No more remaining cards to animate (remainingIndex: ${remainingIndex})`);
                        }
                    }
                    
                    console.log(`Scheduled ${remainingIndex} remaining card animations`);
                } else {
                    console.error("❌ Challenge cards container not found!");
                }
            } else {
                console.log("❌ CHALLENGER CONDITION NOT MET");
                console.log("isMatch:", isMatch);
                console.log("isChallenger:", isChallenger); 
                console.log("remainingCards:", remainingCards);
                console.log("remainingCards?.length:", remainingCards?.length);
            }
            
        }, CONFIG.CHALLENGE_CARD_FLIP_DURATION + CONFIG.CHALLENGE_CARD_REVEAL_DELAY);
        
        // Step 4: Clean up and restore original state
        setTimeout(() => {
            console.log("Starting cleanup and restore");
            
            cardElement.style.transform = '';
            cardElement.style.transition = '';
            cardElement.style.position = '';
            cardElement.innerHTML = originalContent;
            cardElement.className = originalClasses;
            
            console.log("Challenge card animation completed");
            resolve();
            
        }, CONFIG.CHALLENGE_CARD_DISPLAY_DURATION + CONFIG.CHALLENGE_CARD_EXTRA_TIME);
    });
}