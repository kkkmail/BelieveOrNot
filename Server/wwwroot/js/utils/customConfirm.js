// Simple replacement for ugly confirm() popups
export function customConfirm(message, title = 'Believe Or Not') {
    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-confirm-overlay';
        
        // Create confirm dialog
        overlay.innerHTML = `
            <div class="custom-confirm">
                <div class="custom-confirm-header">
                    <h3 class="custom-confirm-title">
                        <span class="custom-confirm-icon">🎴</span>
                        ${title}
                    </h3>
                </div>
                <div class="custom-confirm-body">
                    <p class="custom-confirm-message">${message}</p>
                </div>
                <div class="custom-confirm-footer">
                    <button class="custom-confirm-button cancel" data-action="cancel">Cancel</button>
                    <button class="custom-confirm-button confirm" data-action="confirm">OK</button>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(overlay);
        
        // Show with animation
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });
        
        // Handle button clicks
        const confirmBtn = overlay.querySelector('[data-action="confirm"]');
        const cancelBtn = overlay.querySelector('[data-action="cancel"]');
        
        const handleClick = (result) => {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
                resolve(result);
            }, 200);
        };
        
        confirmBtn.addEventListener('click', () => handleClick(true));
        cancelBtn.addEventListener('click', () => handleClick(false));
        
        // Handle ESC key (should cancel)
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEsc);
                handleClick(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        // Focus the confirm button by default
        setTimeout(() => confirmBtn.focus(), 100);
    });
}