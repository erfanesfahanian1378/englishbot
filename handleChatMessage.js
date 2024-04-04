// handleChatMessage.js
const io = require('socket.io-client');

async function handleChatMessage(bot, chatId, messageText, status) {
    await bot.sendMessage(chatId, "Hi ");
    const socket = io('http://localhost:3002');

    socket.on('chaM', (data) => {
        console.log("this is data chatMessage", data);
        bot.sendMessage(chatId, data.content);
    });
    if (status === 'chat') {
        console.log("the status is chat");
        socket.emit('chatMessage', {senderIdChat: chatId, content: messageText});
    } else {
        socket.on('connect', () => {
            console.log('Connected to the server');
            // Request a chat upon some user action
            socket.emit('requestChat', {idchat: chatId, dataSender: "this is the data"});
        });
        socket.on('chatPartnerDisconnected', (data) => {
            console.log(chatId + " : " + data);
            // Proceed to establish chat with the partner
        });
        socket.on('matchFound', (data) => {
            console.log(chatId + 'Chat partner found:', data);
            bot.sendMessage(chatId, "🥳🎉Congratulation, You are connected to Your english partner");
            // Proceed to establish chat with the partner
        });
    }


}

module.exports = {handleChatMessage};
