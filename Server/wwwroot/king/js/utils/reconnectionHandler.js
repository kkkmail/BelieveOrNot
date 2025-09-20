// Server/wwwroot/king/js/utils/reconnectionHandler.js
import { connection, setGameState, setPlayerId, playerId } from "../core/variables.js";
import { showGameBoard } from "./showGameBoard.js";
import { updateGameDisplay } from "../display/updateGameDisplay.js";
import { customAlert } from "../../../js/utils/customAlert.js";

export async function attemptReconnection(matchId) {
    if (!connection || !playerId) {
        console.log("King connection or playerId not available for reconnection");
        return false;
    }

    try {
        console.log("King attempting reconnection to match:", matchId);

        const result = await connection.invoke("ReconnectToMatch", matchId, playerId);

        if (result.success) {
            console.log("King reconnection successful:", result.message);

            setGameState(result.gameState);
            setPlayerId(result.playerId);

            showGameBoard();
            updateGameDisplay();

            return true;
        } else {
            console.log("King reconnection failed:", result.message);
            await customAlert(result.message);
            return false;
        }
    } catch (err) {
        console.error("King reconnection error:", err);

        let errorMessage = "Failed to reconnect to King game";
        if (err.message) {
            if (err.message.includes("no longer exists")) {
                errorMessage = "The King game you were trying to rejoin no longer exists or has ended.";
            } else if (err.message.includes("not found")) {
                errorMessage = "You were not found in this King game.";
            } else {
                errorMessage = "Failed to reconnect: " + err.message;
            }
        }

        await customAlert(errorMessage);
        return false;
    }
}
