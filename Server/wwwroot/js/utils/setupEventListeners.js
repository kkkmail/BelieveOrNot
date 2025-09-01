function setupEventListeners() {
    console.log("Setting up event listeners...");

    // Challenge area buttons
    const submitChallengeBtn = document.getElementById('submitChallengeBtn');
    const hideChallengeBtn = document.getElementById('hideChallengeBtn');

    if (submitChallengeBtn) {
        submitChallengeBtn.addEventListener('click', function(event) {
            event.preventDefault();
            console.log("Submit challenge button clicked");
            submitChallenge();
        });
    }

    if (hideChallengeBtn) {
        hideChallengeBtn.addEventListener('click', function(event) {
            event.preventDefault();
            console.log("Hide challenge button clicked");
            hideChallenge();
        });
    }

    console.log("Event listeners set up successfully");
}