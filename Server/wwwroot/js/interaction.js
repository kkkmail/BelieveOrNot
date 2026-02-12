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
        var minSelect = parseInt(container.getAttribute("data-min-select"), 10) || 0;
        var selectMode = container.getAttribute("data-select-mode") || "multi";
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

    function getDefaultMessage() {
        var actions = document.getElementById("table-actions");
        if (!actions) return "";
        var rankSelector = actions.querySelector(".rank-selector[data-first-turn]");
        if (rankSelector) return "Select cards from your hand to play";
        var hiddenRank = actions.querySelector("input[name='declaredRank'][type='hidden']");
        if (hiddenRank) return "Select cards to play as " + hiddenRank.value + " or click a card to challenge";
        return "";
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
            // Cards selected: show play controls, hide challenge
            if (playBtn) {
                playBtn.hidden = false;
                playBtn.textContent = "PLAY " + count + " CARD" + (count > 1 ? "S" : "");
            }
            if (rankSelector) rankSelector.hidden = false;
            if (challengeBtn) challengeBtn.hidden = true;

            // Deselect any previous-play radios (mutual exclusion)
            var prevPlay = document.getElementById("previous-play");
            if (prevPlay) {
                prevPlay.querySelectorAll('input[type="radio"]').forEach(function (r) {
                    r.checked = false;
                });
            }

            // Build preview from selected cards
            if (message) {
                var preview = [];
                checked.forEach(function (cb) {
                    var card = cb.closest("[data-rank][data-suit]");
                    if (card) {
                        var r = card.getAttribute("data-rank");
                        var s = card.getAttribute("data-suit");
                        var sym = { Hearts: "♥", Diamonds: "♦", Clubs: "♣", Spades: "♠" }[s] || "";
                        preview.push(r === "Joker" ? "🃏" : r + sym);
                    }
                });
                message.textContent = "Playing: " + preview.join(" ");
            }
        } else {
            // No cards selected: hide play controls
            if (playBtn) playBtn.hidden = true;
            if (rankSelector) rankSelector.hidden = true;
            if (message) message.innerHTML = getDefaultMessage();
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
            if (message) message.textContent = "Flip card " + idx + " to challenge";
        } else {
            // No previous-play card selected: hide challenge
            if (challengeBtn) challengeBtn.hidden = true;
            if (message) message.innerHTML = getDefaultMessage();
        }
    }

    function resetControls() {
        var actions = document.getElementById("table-actions");
        if (!actions) return;
        var playBtn = actions.querySelector("#play-btn");
        var rankSelector = actions.querySelector(".rank-selector");
        var challengeBtn = actions.querySelector("#challenge-btn");
        if (playBtn) playBtn.hidden = true;
        if (rankSelector) rankSelector.hidden = true;
        if (challengeBtn) challengeBtn.hidden = true;
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

        // Previous-play radio changed
        if (target.type === "radio" && target.name === "challengePickIndex") {
            updateChallengeControls();
        }
    });

    // Re-apply after htmx swaps new HTML into the DOM
    document.addEventListener("htmx:afterSwap", function (e) {
        applyAll(e.detail.target);
        resetControls();
    });

    // Re-apply after SSE-driven out-of-band swaps
    document.addEventListener("htmx:oobAfterSwap", function (e) {
        applyAll(e.detail.target);
        var id = e.detail.target.id;
        if (id === "table-actions" || id === "hand-area" || id === "previous-play") {
            resetControls();
        }
    });

    // Initial application on page load
    document.addEventListener("DOMContentLoaded", function () {
        applyAll(document);
    });
})();
