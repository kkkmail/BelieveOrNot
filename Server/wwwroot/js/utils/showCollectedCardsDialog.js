// js/utils/showCollectedCardsDialog.js
import {getSuitSymbol} from "../cards/getSuitSymbol.js";

export function showCollectedCardsDialog(collectorName, lastPlayCards, otherCards) {
    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-confirm-overlay';

        // Create dialog
        overlay.innerHTML = `
            <div class="custom-confirm collected-cards-dialog">
                <div class="custom-confirm-header">
                    <h3 class="custom-confirm-title">
                        <span class="custom-confirm-icon">🎴</span>
                        Cards Collected by ${collectorName}
                    </h3>
                </div>
                <div class="custom-confirm-body">
                    <div class="collected-cards-content">
                        <div class="collected-cards-section">
                            <div class="collected-cards-label">Last Player's Cards:</div>
                            <div class="collected-cards-row" id="lastPlayCardsRow">
                                <!-- Last play cards will be inserted here -->
                            </div>
                        </div>
                        ${otherCards && otherCards.length > 0 ? `
                        <div class="collected-cards-section">
                            <div class="collected-cards-label">Other Cards:</div>
                            <div class="collected-cards-row" id="otherCardsRow">
                                <!-- Other cards will be inserted here -->
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="custom-confirm-footer">
                    <button class="custom-confirm-button confirm" data-action="ok">OK</button>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(overlay);

        // Populate cards
        populateCardRow('lastPlayCardsRow', lastPlayCards);
        if (otherCards && otherCards.length > 0) {
            populateCardRow('otherCardsRow', otherCards);
        }

        // Show with animation
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        // Handle OK button
        const okBtn = overlay.querySelector('[data-action="ok"]');
        const handleClose = () => {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
                resolve();
            }, 200);
        };

        okBtn.addEventListener('click', handleClose);

        // Handle ESC key
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEsc);
                handleClose();
            }
        };
        document.addEventListener('keydown', handleEsc);

        // Focus the OK button
        setTimeout(() => okBtn.focus(), 100);
    });
}

function populateCardRow(containerId, cards) {
    const container = document.getElementById(containerId);
    if (!container || !cards || cards.length === 0) return;

    container.innerHTML = '';

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card collected-card';

        // Create card content using same structure as hand cards
        const rank = card.rank || card.Rank;
        const suit = card.suit || card.Suit;
        const isJoker = card.isJoker || card.IsJoker || rank === 'Joker';

        if (isJoker) {
            cardElement.classList.add('joker');
            cardElement.innerHTML = `
                <div class="rank">★</div>
                <div class="suit">JOKER</div>
            `;
        } else {
            cardElement.classList.add(suit.toLowerCase());
            cardElement.innerHTML = `
                <div class="rank">${rank}</div>
                <div class="suit">${getSuitSymbol(suit)}</div>
            `;
        }

        container.appendChild(cardElement);
    });
}
