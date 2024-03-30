
// handleChatMessage.js
async function handleChatMessage(bot, chatId, messageText) {
    // Check if the message matches the specific option
    if (messageText === "Protein Ai 🧠 Language Exchange Partner") {
        await bot.sendMessage(chatId, "Hi ");
    }
}

module.exports = { handleChatMessage };
