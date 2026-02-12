// interaction.js
// Server-driven constraint enforcement for card selection and form controls.
// All rules come from data-* attributes rendered by the server in Razor partials.
// This file must NOT hold game state, render HTML, or communicate with the server.

(function () {
    "use strict";

    // === Constraint enforcement (max/min card selection) ===

    function applyConstraints(container) {
        if (!container) return;

        var maxSelect = parseInt(container.getAttribute("data-max-select"), 10) || Infinity;
        var selectableSuits = parseList(container.getAttribute("data-selectable-suits"));
        var selectableRanks = parseList(container.getAttribute("data-selectable-ranks"));

        var checkboxes = container.querySelectorAll('input[type="checkbox"], input[type="radio"]');
        var checkedCount = 0;

        checkboxes.forEach(function (cb) {
            if (cb.checked) checkedCount++;
        });

        checkboxes.forEach(function (cb) {
            var card = cb.closest("[data-suit][data-rank]");
            var suitAllowed = !selectableSuits || selectableSuits.includes(card ? card.getAttribute("data-suit") : "");
            var rankAllowed = !selectableRanks || selectableRanks.includes(card ? card.getAttribute("data-rank") : "");

            if (!suitAllowed || !rankAllowed) {
                cb.disabled = true;
            } else if (!cb.checked && checkedCount >= maxSelect) {
                cb.disabled = true;
            } else {
                cb.disabled = false;
            }
        });

        // Update counter element if present
        var counter = container.querySelector(".selection-counter");
        if (counter) {
            if (maxSelect < Infinity) {
                counter.textContent = checkedCount + " of " + maxSelect + " selected";
            } else {
                counter.textContent = checkedCount + " selected";
            }
        }
    }

    function parseList(value) {
        if (!value || value.trim() === "") return null;
        return value.split(",").map(function (s) { return s.trim(); });
    }

    function findConstraintContainers(root) {
        var containers = [];
        if (root.hasAttribute && root.hasAttribute("data-max-select")) {
            containers.push(root);
        }
        var nested = (root.querySelectorAll || function () { return []; }).call(root, "[data-max-select], [data-min-select], [data-select-mode], [data-selectable-suits], [data-selectable-ranks]");
        nested.forEach(function (el) { containers.push(el); });
        return containers;
    }

    function applyAll(root) {
        findConstraintContainers(root || document).forEach(applyConstraints);
    }

    // === Play / Challenge toggling ===

    function isFirstTurn() {
        var actions = document.getElementById("table-actions");
        if (!actions) return false;
        return !!actions.querySelector(".rank-selector[data-first-turn]");
    }

    function getSelectedRank() {
        var actions = document.getElementById("table-actions");
        if (!actions) return null;
        var checked = actions.querySelector('.rank-btn input[type="radio"]:checked');
        return checked ? checked.value : null;
    }

    function updatePlayControls() {
        var handArea = document.getElementById("hand-area");
        var actions = document.getElementById("table-actions");
        if (!handArea || !actions) return;

        var checked = handArea.querySelectorAll('input[type="checkbox"]:checked');
        var count = checked.length;
        var playBtn = actions.querySelector("#play-btn");
        var rankSelector = actions.querySelector(".rank-selector");
        var challengeBtn = actions.querySelector("#challenge-btn");
        var message = actions.querySelector(".table-message");

        if (count > 0) {
            // Cards selected: show rank selector (if first turn) and play button
            if (rankSelector) rankSelector.hidden = false;
            if (playBtn) {
                playBtn.hidden = false;
                playBtn.textContent = "PLAY " + count + " CARD" + (count > 1 ? "S" : "");
                // Disable play button until rank is declared (first turn only)
                if (isFirstTurn()) {
                    playBtn.disabled = !getSelectedRank();
                } else {
                    playBtn.disabled = false;
                }
            }
            if (challengeBtn) challengeBtn.hidden = true;

            // Deselect any previous-play radios (mutual exclusion)
            var prevPlay = document.getElementById("previous-play");
            if (prevPlay) {
                prevPlay.querySelectorAll('input[type="radio"]').forEach(function (r) {
                    r.checked = false;
                });
            }

            // Hide the instructional message when cards are selected
            if (message) message.hidden = true;
        } else {
            // No cards selected: hide play controls and clear rank
            if (playBtn) {
                playBtn.hidden = true;
                playBtn.disabled = true;
            }
            if (rankSelector) {
                rankSelector.hidden = true;
                // Clear rank selection
                rankSelector.querySelectorAll('input[type="radio"]').forEach(function (r) {
                    r.checked = false;
                });
            }
            if (message) message.hidden = false;
        }
    }

    function updateChallengeControls() {
        var prevPlay = document.getElementById("previous-play");
        var actions = document.getElementById("table-actions");
        if (!prevPlay || !actions) return;

        var checkedRadio = prevPlay.querySelector('input[type="radio"]:checked');
        var challengeBtn = actions.querySelector("#challenge-btn");
        var playBtn = actions.querySelector("#play-btn");
        var rankSelector = actions.querySelector(".rank-selector");
        var message = actions.querySelector(".table-message");

        if (checkedRadio) {
            // Previous-play card selected: show challenge, hide play controls
            if (challengeBtn) challengeBtn.hidden = false;
            if (playBtn) playBtn.hidden = true;
            if (rankSelector) rankSelector.hidden = true;

            // Uncheck all hand checkboxes (mutual exclusion)
            var handArea = document.getElementById("hand-area");
            if (handArea) {
                handArea.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
                    cb.checked = false;
                });
                applyConstraints(handArea);
            }

            var idx = parseInt(checkedRadio.value, 10) + 1;
            if (message) {
                message.textContent = "Flip card " + idx + " to challenge";
                message.hidden = false;
            }
        } else {
            // No previous-play card selected: hide challenge
            if (challengeBtn) challengeBtn.hidden = true;
            if (message) message.hidden = false;
        }
    }

    function resetControls() {
        var actions = document.getElementById("table-actions");
        if (!actions) return;
        var playBtn = actions.querySelector("#play-btn");
        var rankSelector = actions.querySelector(".rank-selector");
        var challengeBtn = actions.querySelector("#challenge-btn");
        var message = actions.querySelector(".table-message");
        if (playBtn) { playBtn.hidden = true; playBtn.disabled = true; }
        if (rankSelector) rankSelector.hidden = true;
        if (challengeBtn) challengeBtn.hidden = true;
        if (message) message.hidden = false;
    }

    // === Radio button toggle-off support ===
    // HTML radios can't be unchecked by clicking again; this enables it.

    var lastCheckedRadio = {};

    function handleRadioClick(e) {
        var radio = e.target;
        if (radio.type !== "radio") return;

        var key = radio.name;
        if (lastCheckedRadio[key] === radio) {
            // Same radio clicked again: uncheck it
            radio.checked = false;
            delete lastCheckedRadio[key];
            // Fire change event so other handlers react
            radio.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
            lastCheckedRadio[key] = radio;
        }
    }

    // === Event listeners ===

    // Re-apply constraints when any checkbox/radio changes
    document.addEventListener("change", function (e) {
        var target = e.target;
        if (target.type === "checkbox" || target.type === "radio") {
            var container = target.closest("[data-max-select], [data-min-select], [data-select-mode], [data-selectable-suits], [data-selectable-ranks]");
            if (container) applyConstraints(container);
        }

        // Hand card selection changed
        if (target.type === "checkbox" && target.name === "cardIndices") {
            updatePlayControls();
        }

        // Rank radio selection changed (first turn)
        if (target.type === "radio" && target.name === "declaredRank") {
            var playBtn = document.getElementById("play-btn");
            if (playBtn && !playBtn.hidden) {
                playBtn.disabled = !target.checked;
            }
        }

        // Previous-play radio changed
        if (target.type === "radio" && target.name === "challengePickIndex") {
            updateChallengeControls();
        }
    });

    // Click handler for radio toggle-off (must use click, not change)
    document.addEventListener("click", handleRadioClick);

    // Re-apply after htmx swaps new HTML into the DOM
    document.addEventListener("htmx:afterSwap", function (e) {
        applyAll(e.detail.target);
        resetControls();
        lastCheckedRadio = {};
    });

    // Re-apply after SSE-driven out-of-band swaps
    document.addEventListener("htmx:oobAfterSwap", function (e) {
        applyAll(e.detail.target);
        var id = e.detail.target.id;
        if (id === "table-actions" || id === "hand-area" || id === "previous-play") {
            resetControls();
            lastCheckedRadio = {};
        }
    });

    // Initial application on page load
    document.addEventListener("DOMContentLoaded", function () {
        applyAll(document);
    });
})();
