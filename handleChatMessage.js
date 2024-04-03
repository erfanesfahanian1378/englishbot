// handleChatMessage.js
const io = require('socket.io-client');

async function handleChatMessage(bot, chatId, messageText) {
    await bot.sendMessage(chatId, "Hi ");
    const socket = io('http://localhost:3002');

    socket.on('connect', () => {
        console.log('Connected to the server');
        // Request a chat upon some user action
        socket.emit('requestChat', {idchat: chatId, dataSender: "this is the data"});
    });

// Listen for a chat partner found event
    socket.on('chatPartnerFound', (data) => {
        console.log(chatId + 'Chat partner found:', data.partnerId);
        // Proceed to establish chat with the partner
    });

    socket.on('chatPartnerDisconnected', (data) => {
        console.log(chatId + " : " + data);
        // Proceed to establish chat with the partner
    });
    socket.on('matchFound', (data) => {
        console.log(chatId + 'Chat partner found:', data);
        // Proceed to establish chat with the partner
    });


}

module.exports = {handleChatMessage};
