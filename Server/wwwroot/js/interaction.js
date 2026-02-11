// interaction.js
// Server-driven constraint enforcement for card selection and form controls.
// All rules come from data-* attributes rendered by the server in Razor partials.
// This file must NOT hold game state, render HTML, or communicate with the server.

(function () {
    "use strict";

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

        // Enable/disable submit buttons based on min selection
        var form = container.closest("form");
        if (form) {
            var submitBtns = form.querySelectorAll('button[type="submit"], input[type="submit"]');
            submitBtns.forEach(function (btn) {
                btn.disabled = checkedCount < minSelect;
            });
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

    // Re-apply constraints when any checkbox/radio changes
    document.addEventListener("change", function (e) {
        var target = e.target;
        if (target.type === "checkbox" || target.type === "radio") {
            var container = target.closest("[data-max-select], [data-min-select], [data-select-mode], [data-selectable-suits], [data-selectable-ranks]");
            if (container) applyConstraints(container);
        }
    });

    // Re-apply after htmx swaps new HTML into the DOM
    document.addEventListener("htmx:afterSwap", function (e) {
        applyAll(e.detail.target);
    });

    // Re-apply after SSE-driven out-of-band swaps
    document.addEventListener("htmx:oobAfterSwap", function (e) {
        applyAll(e.detail.target);
    });

    // Initial application on page load
    document.addEventListener("DOMContentLoaded", function () {
        applyAll(document);
    });
})();
