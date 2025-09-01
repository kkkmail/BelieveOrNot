function setupEventListeners() {
    console.log("Setting up event listeners...");

    // Setup form buttons (these exist immediately)
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

    console.log("Initial event listeners set up");
}

// NEW FUNCTION: Set up game board event listeners separately after HTML is loaded
function setupGameBoardEventListeners() {
    console.log("Setting up game board event listeners...");

    // Game board buttons (these are loaded dynamically)
    const startRoundBtn = document.getElementById('startRoundBtn');
    const playBtn = document.getElementById('playBtn');
    const challengeBtn = document.getElementById('challengeBtn');
    
    if (startRoundBtn) {
        // Remove any existing listeners first
        const newStartBtn = startRoundBtn.cloneNode(true);
        startRoundBtn.parentNode.replaceChild(newStartBtn, startRoundBtn);
        
        newStartBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Start round button clicked");
            startRound();
        });
    }

    if (playBtn) {
        const newPlayBtn = playBtn.cloneNode(true);
        playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
        
        newPlayBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Play button clicked");
            playCards();
        });
    }

    if (challengeBtn) {
        const newChallengeBtn = challengeBtn.cloneNode(true);
        challengeBtn.parentNode.replaceChild(newChallengeBtn, challengeBtn);
        
        newChallengeBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Challenge button clicked");
            showChallenge();
        });
    }

    // Challenge area buttons (may not exist initially)
    setTimeout(() => {
        const submitChallengeBtn = document.getElementById('submitChallengeBtn');
        const hideChallengeBtn = document.getElementById('hideChallengeBtn');

        if (submitChallengeBtn && !submitChallengeBtn.hasAttribute('data-listener-added')) {
            submitChallengeBtn.setAttribute('data-listener-added', 'true');
            submitChallengeBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                console.log("Submit challenge button clicked");
                submitChallenge();
            });
        }

        if (hideChallengeBtn && !hideChallengeBtn.hasAttribute('data-listener-added')) {
            hideChallengeBtn.setAttribute('data-listener-added', 'true');
            hideChallengeBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                console.log("Hide challenge button clicked");
                hideChallenge();
            });
        }
    }, 100);

    console.log("Game board event listeners set up");
}