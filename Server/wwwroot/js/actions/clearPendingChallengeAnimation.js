// js/actions/clearPendingChallengeAnimation.js

export function clearPendingChallengeAnimation() {
    window.pendingChallengeAnimation = null;
    console.log("🧹 Cleared pending challenge animation");
}