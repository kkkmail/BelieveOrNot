// Server/wwwroot/king/js/actions/startRound.js
import { connection, currentMatch, playerId } from "../core/variables.js";
import { customAlert } from "../../../js/utils/customAlert.js";

export async function startRound() {
    if (!currentMatch || !playerId) {
        await customAlert('Cannot start round: match or player not found');
        return;
    }

    try {
        await connection.invoke("StartRound", {
            matchId: currentMatch.id,
            playerId: playerId
        });
        console.log("King round started successfully");
    } catch (err) {
        console.error("Failed to start King round:", err);
        await customAlert("Failed to start round: " + err);
    }
}