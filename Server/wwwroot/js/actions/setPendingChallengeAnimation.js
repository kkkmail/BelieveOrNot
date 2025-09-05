// js/actions/setPendingChallengeAnimation.js

export function setPendingChallengeAnimation(animationInfo) {
    window.pendingChallengeAnimation = animationInfo;
    console.log("✅ Pending challenge animation set up:", window.pendingChallengeAnimation);
}