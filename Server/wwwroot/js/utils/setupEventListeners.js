function setupEventListeners() {
    console.log("Setting up event listeners...");

    // Setup form buttons
    const createMatchBtn = document.getElementById('createMatchBtn');
    const joinMatchBtn = document.getElementById('joinMatchBtn');
    
    if (createMatchBtn) {
        createMatchBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Create match button clicked");
            createMatch();
        });
    }

    if (joinMatchBtn) {
        joinMatchBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Join match button clicked");
            joinMatch();
        });
    }

    // Game board buttons
    const startRoundBtn = document.getElementById('startRoundBtn');
    const playBtn = document.getElementById('playBtn');
    const challengeBtn = document.getElementById('challengeBtn');
    
    if (startRoundBtn) {
        startRoundBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Start round button clicked");
            startRound();
        });
    }

    if (playBtn) {
        playBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Play button clicked");
            playCards();
        });
    }

    if (challengeBtn) {
        challengeBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Challenge button clicked");
            showChallenge();
        });
    }

    // Challenge area buttons
    const submitChallengeBtn = document.getElementById('submitChallengeBtn');
    const hideChallengeBtn = document.getElementById('hideChallengeBtn');

    if (submitChallengeBtn) {
        submitChallengeBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Submit challenge button clicked");
            submitChallenge();
        });
    }

    if (hideChallengeBtn) {
        hideChallengeBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Hide challenge button clicked");
            hideChallenge();
        });
    }

    console.log("Event listeners set up successfully");
}