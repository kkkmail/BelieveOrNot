function setupEventListeners() {
    console.log("Setting up event listeners...");

    // Setup form buttons (these exist immediately)
    setupFormButtons();
    
    console.log("Initial event listeners set up");
}

function setupFormButtons() {
    const createMatchBtn = document.getElementById('createMatchBtn');
    const joinMatchBtn = document.getElementById('joinMatchBtn');
    
    if (createMatchBtn && !createMatchBtn.hasAttribute('data-listener')) {
        createMatchBtn.setAttribute('data-listener', 'true');
        createMatchBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Create match button clicked");
            createMatch();
        });
    }

    if (joinMatchBtn && !joinMatchBtn.hasAttribute('data-listener')) {
        joinMatchBtn.setAttribute('data-listener', 'true');
        joinMatchBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Join match button clicked");
            joinMatch();
        });
    }
}

// NEW: Safer game board event setup that prevents duplicates
function setupGameBoardEventListeners() {
    console.log("Setting up game board event listeners...");
    
    // Wait a bit for DOM to be ready
    setTimeout(() => {
        setupGameButtons();
        setupChallengeButtons();
        setupCopyButton(); // NEW: Setup copy match ID button
    }, 100);
}

function setupGameButtons() {
    const startRoundBtn = document.getElementById('startRoundBtn');
    const playBtn = document.getElementById('playBtn');
    const challengeBtn = document.getElementById('challengeBtn');
    
    if (startRoundBtn && !startRoundBtn.hasAttribute('data-listener')) {
        startRoundBtn.setAttribute('data-listener', 'true');
        startRoundBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Start round button clicked");
            startRound();
        });
        console.log("Start round button listener added");
    }

    if (playBtn && !playBtn.hasAttribute('data-listener')) {
        playBtn.setAttribute('data-listener', 'true');
        playBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Play button clicked");
            playCards();
        });
        console.log("Play button listener added");
    }

    if (challengeBtn && !challengeBtn.hasAttribute('data-listener')) {
        challengeBtn.setAttribute('data-listener', 'true');
        challengeBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Challenge button clicked");
            showChallenge();
        });
        console.log("Challenge button listener added");
    }
}

function setupChallengeButtons() {
    const submitChallengeBtn = document.getElementById('submitChallengeBtn');
    const hideChallengeBtn = document.getElementById('hideChallengeBtn');

    if (submitChallengeBtn && !submitChallengeBtn.hasAttribute('data-listener')) {
        submitChallengeBtn.setAttribute('data-listener', 'true');
        submitChallengeBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Submit challenge button clicked");
            submitChallenge();
        });
        console.log("Submit challenge button listener added");
    }

    if (hideChallengeBtn && !hideChallengeBtn.hasAttribute('data-listener')) {
        hideChallengeBtn.setAttribute('data-listener', 'true');
        hideChallengeBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Hide challenge button clicked");
            hideChallenge();
        });
        console.log("Hide challenge button listener added");
    }
}

// NEW: Setup copy match ID button
function setupCopyButton() {
    const copyMatchIdBtn = document.getElementById('copyMatchIdBtn');
    
    if (copyMatchIdBtn && !copyMatchIdBtn.hasAttribute('data-listener')) {
        copyMatchIdBtn.setAttribute('data-listener', 'true');
        copyMatchIdBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Copy match ID button clicked");
            copyMatchId();
        });
        console.log("Copy match ID button listener added");
    }
}