// Server/wwwroot/king/js/utils/setupFormButtons.js
import { createMatch } from "../actions/createMatch.js";
import { joinMatch } from "../actions/joinMatch.js";

export function setupFormButtons() {
    const createMatchBtn = document.getElementById('createMatchBtn');
    const joinMatchBtn = document.getElementById('joinMatchBtn');

    if (createMatchBtn && !createMatchBtn.hasAttribute('data-listener')) {
        createMatchBtn.setAttribute('data-listener', 'true');
        createMatchBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("King create match button clicked");
            createMatch();
        });
        console.log("King create match button listener added");
    }

    if (joinMatchBtn && !joinMatchBtn.hasAttribute('data-listener')) {
        joinMatchBtn.setAttribute('data-listener', 'true');
        joinMatchBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("King join match button clicked");
            joinMatch();
        });
        console.log("King join match button listener added");
    }
}