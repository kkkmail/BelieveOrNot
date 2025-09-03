// js/utils/customAlert.js
// Simple replacement for ugly alert() popups - now supports HTML content
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
                    <div class="custom-alert-message"></div>
                </div>
                <div class="custom-alert-footer">
                    <button class="custom-alert-button" data-action="ok">OK</button>
                </div>
            </div>
        `;
        
        // Set message content using innerHTML to support HTML formatting
        const messageDiv = overlay.querySelector('.custom-alert-message');
        messageDiv.innerHTML = message; // This allows HTML formatting
        
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