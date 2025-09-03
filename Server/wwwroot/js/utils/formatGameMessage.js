// js/utils/formatGameMessage.js
// This file is no longer needed since we use structured messages from the server
// with parseStructuredMessage.js handling the formatting
// 
// Keeping this as a passthrough for any remaining references

export function formatGameMessage(message) {
    // Messages are now formatted server-side with special markers
    // and parsed client-side with parseStructuredMessage.js
    // This function is kept for backward compatibility but does nothing
    return message;
}