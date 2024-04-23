// handleChatMessage.js
const io = require('socket.io-client');
const axios = require("axios");
let userProfile = '📖✏️Your profile';
let aboutUs = 'about us';
const initQuiz = "start the quiz";
let partnerTalkOptions = ["🙋‍♂️Language Partner🙋", "🧠AI Language Partner🧠"]
async function handleChatMessage(bot, chatId, messageText, status) {
    const socket = io('http://localhost:3002');
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{text: 'End Chat', callback_data: 'end_searching'}] // 'callback_data' is what gets sent back to your bot
            ]
        }
    };

    socket.on('chaM', (data) => {
        if (data.content.includes("Protein_English_Bot_")) {
            const filename = data.content.replace("Protein_English_Bot_", "")
            // Using bot.sendAudio to send the audio file from local file system
            bot.sendAudio(chatId, filename).then(() => {
                console.log("Voice message sent successfully.");
            }).catch((error) => {
                console.error("Failed to send voice message:", error);
            });

        } else if (data.content.includes("Protein_English_Photo_")) {
            const filename = data.content.replace("Protein_English_Photo_", "")
            const localFilePath = `./media/${filename}`;
            console.log("this is local file path : " + localFilePath);
            // Using bot.sendAudio to send the audio file from local file system
            bot.sendPhoto(chatId, localFilePath).then(() => {
                console.log("photo sent successfully.");
            }).catch((error) => {
                console.error("Failed to send voice message:", error);
            });
        } else if (data.content.includes("Protein_English_Video2_")) {
            const filename = data.content.replace("Protein_English_Video2_", "")
            console.log("this is the id video");
            console.log(filename);
            console.log("this is the id video");
            // const localFilePath = `./media/${filename}`;
            // Using bot.sendAudio to send the audio file from local file system
            bot.sendVideo(chatId, filename).then(() => {
                console.log("photo sent successfully.");
            }).catch((error) => {
                console.error("Failed to send voice message:", error);
            });
        } else if (data.content.includes("Protein_English_Video_")) {
            const filename = data.content.replace("Protein_English_Video2_", "")
            const localFilePath = `./media/${filename}`;
            console.log("this is local file path : " + localFilePath);
            // Using bot.sendAudio to send the audio file from local file system
            bot.sendVideo(chatId, localFilePath).then(() => {
                console.log("photo sent successfully.");
            }).catch((error) => {
                console.error("Failed to send voice message:", error);
            });
        } else if (data.content.includes("Protein_English_VideoM_")) {
            const VideoMId = data.content.replace("Protein_English_VideoM_", "")
            try {
                bot.sendVideoNote(chatId, VideoMId);
                console.log(`Video message sent with file_id: ${VideoMId}`);
            } catch (error) {
                console.error(`Failed to send sticker: ${error}`);
            }
        } else if (data.content.includes("Protein_English_Sticker_")) {
            const stickerFileId = data.content.replace("Protein_English_Sticker_", "")
            try {
                bot.sendSticker(chatId, stickerFileId);
                console.log(`Sticker sent with file_id: ${stickerFileId}`);
            } catch (error) {
                console.error(`Failed to send sticker: ${error}`);
            }
        } else if (data.content.includes("Protein_English_Document_")) {
            const documentFileId = data.content.replace("Protein_English_Document_", "")
            try {
                bot.sendSticker(chatId, documentFileId);
                console.log(`Document sent with file_id: ${documentFileId}`);
            } catch (error) {
                console.error(`Failed to send Document: ${error}`);
            }
        } else {
            bot.sendMessage(chatId, data.content);
        }
    });
    if (status === 'disconnect') {
        socket.emit('disconnect2', {senderIdChat: chatId});
        setTimeout(() => {
            socket.disconnect();
            console.log('Client disconnect initiated');
        }, 1000);
        console.log("we are disconnected");

    }else if (status === 'chat') {
        console.log("the status is chat");
        socket.emit('chatMessage', {senderIdChat: chatId, content: messageText});
        await bot.sendMessage(chatId, "Message Received🎉", opts);
    } else {
        socket.on('connect', async () => {
            console.log('Connected to the server');
            // Request a chat upon some user action
            const response = await axios.get("http://localhost:3001/findTestEnglish?idChat=" + chatId);
            const level =  response.data[response.data.length - 1].level;
            console.log(response.data.length);
            socket.emit('requestChat', {idchat: chatId, dataSender: "this is the data", level: level});
        });
        socket.on('chatPartnerDisconnected', (data) => {
             bot.sendMessage(chatId, "Your partner left the chat", {
                reply_markup: {
                    keyboard: [
                        [{text: partnerTalkOptions[0]}],
                        [{text: partnerTalkOptions[1]}],
                        [{text: initQuiz}],
                        [{text: userProfile}],
                        [{text: aboutUs}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
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
