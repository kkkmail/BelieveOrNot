// js/utils/setupFormButtons.js
import {joinMatch} from "../game/joinMatch.js";
import {createMatch} from "../game/createMatch.js";

export function setupFormButtons() {
    const createMatchBtn = document.getElementById('createMatchBtn');
    const joinMatchBtn = document.getElementById('joinMatchBtn');

    if (createMatchBtn && !createMatchBtn.hasAttribute('data-listener')) {
        createMatchBtn.setAttribute('data-listener', 'true');
        createMatchBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Create match button clicked");
            createMatch();
        });
    }

    if (joinMatchBtn && !joinMatchBtn.hasAttribute('data-listener')) {
        joinMatchBtn.setAttribute('data-listener', 'true');
        joinMatchBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Join match button clicked");
            joinMatch();
        });
    }
}
