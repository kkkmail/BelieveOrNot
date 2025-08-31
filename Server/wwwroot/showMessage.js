function showMessage(message) {
    const messageArea = document.getElementById('messageArea');
    messageArea.textContent = message;

    // Clear message after 5 seconds
    setTimeout(() => {
        if (messageArea.textContent === message) {
            messageArea.textContent = '';
        }
    }, 5000);
}