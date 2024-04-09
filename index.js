const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const token = '6997807654:AAF6mpVsX6o60o0uXPe29jjU-39e3r6VhH0' // this the test token
const bot = new TelegramBot(token, {polling: true});
const userStates = new Map();
const channelUsername = '@englishcommunicatewithAI';
const channelUsername2 = '@ProteinTeam';
const channelForwardName = '@ForwardProteinEnglish';
const joined = 'I joined';
let userProfile = '📖✏️Your profile';
let aboutUs = 'about us';
const {handleChatMessage} = require('./handleChatMessage');
let partnerTalkOptions = ["Protein Ai 🧠 Language Exchange Partner", "🙋‍♂️Language Exchange Partner Online🙋"]
let promoteUs = "Support us by introducing us to your friends for activating your subscription after inviting your friends go to the invite your friends menu.";
let channelJoin = `${channelUsername} ${channelUsername2}` + '\n join these channels to use the bot';
let welcomeMessage = 'Welcome to Protein english bot';
const endChat = "end the chat😢";
const searching = "We are searching for the right person please be patient";
const searchIcon = "🔎";
const wrongInput = "You are not connected to anyone☹️😢";
const opts = {
    reply_markup: {
        inline_keyboard: [
            [{text: 'End Searching', callback_data: 'end_searching'}] // 'callback_data' is what gets sent back to your bot
        ]
    }
};

const voiceDir = path.join(__dirname, 'voice');
if (!fs.existsSync(voiceDir)) {
    fs.mkdirSync(voiceDir, {recursive: true});
}
const mediaDir = path.join(__dirname, 'media');
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, {recursive: true});
}
// isRequestingEndChat
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    let name = msg.from.first_name + "";
    let surName = msg.from.last_name + "";
    let username = msg.from.username;
    let userState = userStates.get(chatId);
    if (!userState) {
        userState = {
            isRequestingChat: false,
            isRequestingEndChat: false,
            isRequestingRecharge: false,
            isCompletingProfile: false,
            isInvitingFriend: false,
            isFinalRequestImage: false,
            createLogo: false,
            lastText: "",
            size: "",
            steps: ""
        };
        userStates.set(chatId, userState);
    }

    if (msg.voice) {
        const fileId = msg.voice.file_id;
        const fileResp = await bot.getFile(fileId);
        const filePath = fileResp.file_path;
        const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
        const fileName = `${fileId}.oga`;
        const voiceFilePath = path.join(voiceDir, fileName);
        const response = await axios({
            method: 'get',
            url: fileUrl,
            responseType: 'stream'
        });
        // Pipe the file stream to a file
        response.data.pipe(fs.createWriteStream(voiceFilePath))
            .on('finish', () => {
                console.log(`Downloaded voice message saved to ${voiceFilePath}`);

                // Once the download is complete, you can emit the custom identifier
                const customIdentifier = `Protein_English_Bot_${fileName}`;
                if (userState.isRequestingChat) {
                    handleChatMessage(bot, chatId, customIdentifier, "chat");
                    bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
                        .then(function (response) {
                            // Message was forwarded successfully
                            console.log("Message forwarded successfully:", response);
                        })
                        .catch(function (error) {
                            // Handle any errors that occur
                            console.error("Error forwarding message:", error);
                        });
                } else {
                    bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
                    bot.sendMessage(chatId, wrongInput, {
                        reply_markup: {
                            keyboard: [
                                [{text: partnerTalkOptions[0]}],
                                [{text: userProfile}],
                                [{text: aboutUs}]
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true
                        }
                    });
                }
                // Assuming you have a mechanism to emit this identifier through WebSocket
                // socket.emit('chatMessage', { senderIdChat: chatId, content: customIdentifier, type: 'voice' });
            })
            .on('error', (error) => {
                console.error(`Error downloading voice message: ${error}`);
            });

        // Emit this identifier to the WebSocket server like a text message
        // const socket = /* Retrieve your socket instance */;
        // socket.emit('chatMessage', {senderIdChat: chatId, content: customIdentifier, type: 'voice'});
    } else if (msg.photo) {
        const photo = msg.photo[msg.photo.length - 1];
        const photoFileId = photo.file_id;
        const photoFileResp = await bot.getFile(photoFileId);
        const photoFilePath = photoFileResp.file_path;
        const photoFileUrl = `https://api.telegram.org/file/bot${token}/${photoFilePath}`;
        const photoFileName = `${photoFileId}.jpg`;
        const localPhotoFilePath = path.join(mediaDir, photoFileName);

        // Download the photo using axios and save it to a local file
        const photoResponse = await axios({
            method: 'get',
            url: photoFileUrl,
            responseType: 'stream'
        });

        photoResponse.data.pipe(fs.createWriteStream(localPhotoFilePath))
            .on('finish', () => {
                console.log(`Downloaded photo message saved to ${localPhotoFilePath}`);


                if (userState.isRequestingChat) {
                    bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
                    handleChatMessage(bot, chatId, `Protein_English_Photo_${photoFileName}`, "chat");
                } else {
                    bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
                    bot.sendMessage(chatId, wrongInput, {
                        reply_markup: {
                            keyboard: [
                                [{text: partnerTalkOptions[0]}],
                                [{text: userProfile}],
                                [{text: aboutUs}]
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true
                        }
                    });
                }
            })
            .on('error', console.error);
    } else if (msg.video) {
        const videoFileId = msg.video.file_id;
        if (userState.isRequestingChat) {
            bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
            // Use a custom identifier for handling video messages
            handleChatMessage(bot, chatId, `Protein_English_Video2_${videoFileId}`, "chat");
        } else {
            bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
            bot.sendMessage(chatId, wrongInput, {
                reply_markup: {
                    keyboard: [
                        [{text: partnerTalkOptions[0]}],
                        [{text: userProfile}],
                        [{text: aboutUs}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }

        // If you want to emit this video file ID via WebSocket
        // socket.emit('chatMessage', { senderIdChat: chatId, content: videoFileId, type: 'video' });
    } else if (msg.sticker) {
        console.log("we are in the sticker");
        // Handle sticker message
        const stickerFileId = msg.sticker.file_id;
        console.log("this is sticker file id " + stickerFileId);
        // Depending on how you want to handle stickers, you could forward the sticker
        // For example, you could emit a WebSocket event with the sticker file ID
        if (userState.isRequestingChat) {
            bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
            await handleChatMessage(bot, chatId, `Protein_English_Sticker_${stickerFileId}`, "chat");
        } else {
            bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
            bot.sendMessage(chatId, wrongInput, {
                reply_markup: {
                    keyboard: [
                        [{text: partnerTalkOptions[0]}],
                        [{text: userProfile}],
                        [{text: aboutUs}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }
    } else if (msg.document) {
        // Here, you might check for MIME type as well if needed
        // For example, if (msg.document.mime_type === 'video/mp4')

        const gifFileId = msg.document.file_id;
        console.log("this is document file id");
        if (userState.isRequestingChat) {
            bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
            await handleChatMessage(bot, chatId, `Protein_English_Document_${gifFileId}`, "chat");
        } else {
            bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
            bot.sendMessage(chatId, wrongInput, {
                reply_markup: {
                    keyboard: [
                        [{text: partnerTalkOptions[0]}],
                        [{text: userProfile}],
                        [{text: aboutUs}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }
        // Or if you want to emit this via WebSocket
        // socket.emit('chatMessage', { senderIdChat: chatId, content: gifFileId, type: 'gif' });
    } else if (text && text.startsWith('/start')) {

        console.log("this is id " + msg.from.id);
        console.log(msg.text)

        const args = msg.text.split(' '); // Splits the message into parts
        if (args.length > 1) {
            const referralId = args[1]; // The second part is the referral ID
            // Handle the referral logic here
            console.log(`User ${username || name} was referred by ${referralId}`);
            try {
                await axios.post('http://localhost:3001/invite', {
                    idChatInvitePerson: referralId,
                    idChatGuest: msg.from.id
                });
                console.log("its in the try");
            } catch (error) {
                console.log("its in the error");
                console.error('Error sending data to server:', error);
            }
        }
        console.log("its before is member");
        let isMember = await checkChannelMembership(chatId, msg.from.id);
        let isMember2 = await checkChannelMembership2(chatId, msg.from.id);
        if (!(isMember && isMember2)) {
            console.log("should be here");
            try {
                await axios.post('http://localhost:3001/start', {
                    username: username,
                    name: name,
                    surName: surName,
                    sexuality: "",
                    age: "",
                    idChat: msg.from.id
                });
            } catch (error) {
                console.error('Error sending data to server:', error);
            }
            bot.sendMessage(chatId, channelJoin, {
                reply_markup: {
                    keyboard: [
                        [{text: joined}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        } else {
            console.log("is it in else ?");
            try {
                await axios.post('http://localhost:3001/start', {
                    username: username,
                    name: name,
                    surName: surName,
                    sexuality: "",
                    age: "",
                    logoChannel: true,
                    idChat: msg.from.id
                });
                await bot.sendMessage(chatId, welcomeMessage);
            } catch (error) {
                console.error('Error sending data to server:', error);
                await bot.sendMessage(chatId, error);
            }
            await sendCustomMessage(bot, chatId);
        }
        userStates.set(chatId, {
            isRequestingChat: false,
            isRequestingRecharge: false,
            isCompletingProfile: false,
            isInvitingFriend: false,
            isRequestingEndChat: false,
            isFinalRequestImage: false,
            createLogo: false,
            size: "",
            steps: ""
        });

    } else if (text && text === joined) {
        console.log("this is id " + msg.from.id);
        // Check if the user is a member of the channel
        let isMember = await checkChannelMembership(chatId, msg.from.id);
        let isMember2 = await checkChannelMembership2(chatId, msg.from.id);
        if (isMember && isMember2) {

            try {
                await axios.post('http://localhost:3001/start', {
                    username: username,
                    name: name,
                    surName: surName,
                    sexuality: "",
                    age: "",
                    logoChannel: true,
                    idChat: msg.from.id
                });
                await bot.sendMessage(chatId, welcomeMessage);
            } catch (error) {
                console.error('Error sending data to server:', error);
                await bot.sendMessage(chatId, error);
            }

            // await bot.sendMessage(chatId, welcomeMessage);
            await sendCustomMessage(bot, chatId);


        } else {
            bot.sendMessage(chatId, channelJoin, {
                reply_markup: {
                    keyboard: [
                        [{text: joined}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }
    } else if (text && text === partnerTalkOptions[0]) {
        userStates.set(chatId, {
            isRequestingChat: true,
        });
        await bot.sendMessage(chatId, searching, opts);
        await bot.sendMessage(chatId, searchIcon);
        await handleChatMessage(bot, chatId, text, "request");
    } else if (text && userState.isRequestingChat) {
        await handleChatMessage(bot, chatId, text, "chat");
        bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
            .then(function (response) {
                // Message was forwarded successfully
                console.log("Message forwarded successfully:", response);
            })
            .catch(function (error) {
                // Handle any errors that occur
                console.error("Error forwarding message:", error);
            });
    } else {
        if (userState.isRequestingChat) {
            const warningMessage = "⚠️Please send only text, voice messages, photos, videos, Sticker or Gif.⚠️";
            await bot.sendMessage(chatId, warningMessage);
        } else {
            await bot.sendMessage(chatId, wrongInput, {
                reply_markup: {
                    keyboard: [
                        [{text: partnerTalkOptions[0]}],
                        [{text: userProfile}],
                        [{text: aboutUs}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }
    }
});

async function sendCustomMessage(bot, chatId) {
    await bot.sendMessage(chatId, promoteUs, {
        reply_markup: {
            keyboard: [
                [{text: partnerTalkOptions[0]}],
                [{text: userProfile}],
                [{text: aboutUs}]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
}

async function checkChannelMembership(chatId, userId) {
    try {
        const member = await bot.getChatMember(channelUsername, userId);
        return member && (member.status === 'member' || member.status === 'administrator' || member.status === 'creator');
    } catch (error) {
        console.error('Error checking channel membership:', error);
        await bot.sendMessage(chatId, 'Error checking channel membership');
        return false;
    }
}

async function checkChannelMembership2(chatId, userId) {
    try {
        const member = await bot.getChatMember(channelUsername2, userId);
        return member && (member.status === 'member' || member.status === 'administrator' || member.status === 'creator');
    } catch (error) {
        console.error('Error checking channel membership:', error);
        bot.sendMessage(chatId, 'خطا در بررسی عضویت کانال.');
        return false;
    }
}

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    // Check if the callback data from the button is to end the search
    if (data === 'end_searching') {
        // Call your function to end the searching process here
        endSearchingForUser(chatId);

        // Optional: Edit the message to reflect that the search has ended
        bot.editMessageText('Search has been ended by the user.', {
            chat_id: chatId,
            message_id: callbackQuery.message.message_id,
            reply_markup: {
                inline_keyboard: []
            }
        });
    }
});

// Define the function that ends the searching process
function endSearchingForUser(chatId) {
    // Your code to handle ending the search
    console.log(`Ending search for user with chatId ${chatId}`);
    // More logic...
}
