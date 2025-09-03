// Simple replacement for ugly alert() popups
export function customAlert(message, title = 'Believe Or Not') {
    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        
        // Create alert dialog
        overlay.innerHTML = `
            <div class="custom-alert">
                <div class="custom-alert-header">
                    <h3 class="custom-alert-title">
                        <span class="custom-alert-icon">🎴</span>
                        ${title}
                    </h3>
                </div>
                <div class="custom-alert-body">
                    <p class="custom-alert-message">${message}</p>
                </div>
                <div class="custom-alert-footer">
                    <button class="custom-alert-button" data-action="ok">OK</button>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(overlay);
        
        // Show with animation
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });
        
        // Handle button click
        const button = overlay.querySelector('[data-action="ok"]');
        const handleClick = () => {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
                resolve();
            }, 200);
        };
        
        button.addEventListener('click', handleClick);
        
        // Handle ESC key
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEsc);
                handleClick();
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        // Focus the button for accessibility
        setTimeout(() => button.focus(), 100);
    });
}