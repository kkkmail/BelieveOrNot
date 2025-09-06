// js/utils/setupBackButton.js
export function setupBackButton() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn && !backBtn.hasAttribute('data-listener')) {
        backBtn.setAttribute('data-listener', 'true');
        backBtn.addEventListener('click', function() {
            // Navigate back to main games page
            window.location.href = '/';
        });
    }
}