// Get current formatted time
import {formatTime} from "./formatTime.js";

export function getCurrentTime() {
    return formatTime(new Date());
}
