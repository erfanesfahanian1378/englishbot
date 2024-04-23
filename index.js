const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const token = '6997807654:AAF6mpVsX6o60o0uXPe29jjU-39e3r6VhH0' // this the test token
const bot = new TelegramBot(token, {polling: true});
const userStates = new Map();
const userScores = new Map();
const channelUsername = '@englishcommunicatewithAI';
const channelUsername2 = '@ProteinTeam';
const channelForwardName = '@ForwardProteinEnglish';
const joined = 'I joined';
let lastMessageId = null;
let userProfile = '📖✏️Your profile';
let aboutUs = 'about us';
const {handleChatMessage} = require('./handleChatMessage');
let partnerTalkOptions = ["🙋‍♂️Language Partner🙋", "🧠AI Language Partner🧠"]
let promoteUs = "Support us by introducing us to your friends for activating your subscription after inviting your friends go to the invite your friends menu.";
let channelJoin = `${channelUsername} ${channelUsername2}` + '\n join these channels to use the bot';
let welcomeMessage = 'Welcome to Protein english bot';
let chatWithAi = '';
const testFirst = ["You should take the test first", "✏️"];
const endChat = "end the chat😢";
const searching = "We are searching for the right person please be patient";
const searchIcon = "🔎";
const initQuiz = "start the quiz";
const submitTest = "Your test submitted successfully";
const wrongInput = "You are not connected to anyone☹️😢";
const opts = {
    reply_markup: {
        inline_keyboard: [
            [{text: 'End Searching', callback_data: 'end_searching'}] // 'callback_data' is what gets sent back to your bot
        ]
    }
};
const questions = [
    {
        text: 'What does the word "benevolent" mean?',
        options: ['Malevolent', 'Kind-hearted', 'Indifferent', 'Mysterious'],
        correctIndex: 1,
        difficulty: 'Easy'
    },
    {
        text: 'Choose the correct form of the verb to complete the sentence: "She ___ to the store yesterday."',
        options: ['go', 'goes', 'went', 'going'],
        correctIndex: 2,
        difficulty: 'Easy'
    },
    {
        text: 'Despite the rain, the match continued. What does this sentence suggest?',
        options: ['The match was cancelled.', 'The rain stopped the match.', 'The match went on regardless of the rain.', 'The rain caused a delay in the match.'],
        correctIndex: 2,
        difficulty: 'Medium'
    },
    {
        text: 'Not only did she finish her work on time, ___ she also helped her colleagues with theirs.',
        options: ['but', 'and', 'or', 'nor'],
        correctIndex: 0,
        difficulty: 'Medium'
    },
    {
        text: 'What does the word "esoteric" mean?',
        options: ['Common', 'Obscure', 'Obvious', 'Entertaining'],
        correctIndex: 1,
        difficulty: 'Hard'
    },
    {
        text: 'Identify the sentence that is grammatically correct.',
        options: ['Him and I went to the market.', 'He and I went to the market.', 'Him and me went to the market.', 'He and me went to the market.'],
        correctIndex: 1,
        difficulty: 'Hard'
    },
    {
        text: '"The sun was setting, casting a golden glow over the city." What time of day is described in the sentence?',
        options: ['Morning', 'Noon', 'Evening', 'Midnight'],
        correctIndex: 2,
        difficulty: 'Easy'
    },
    {
        text: 'Choose the option that correctly uses a semicolon.',
        options: ['She loves cooking; her brother loves baking.', 'She loves cooking, her brother loves baking.', 'She loves cooking her brother loves baking.', 'She loves; cooking, her brother loves baking.'],
        correctIndex: 0,
        difficulty: 'Hard'
    },
    {
        text: 'The word "lament" most nearly means?',
        options: ['Celebrate', 'Regret', 'Ignore', 'Mourn'],
        correctIndex: 3,
        difficulty: 'Medium'
    },
    {
        text: 'Which sentence is correctly punctuated?',
        options: ['Its a beautiful day, isn\'t it?', 'It\'s a beautiful day isn\'t it.', 'It\'s a beautiful day, isn\'t it?', 'It\'s a beautiful day; isn\'t it?'],
        correctIndex: 2,
        difficulty: 'Medium'
    },
    {
        text: '"Even as the debate raged on, her mind remained unswayed by the arguments presented." What does this suggest about her?',
        options: ['She was easily convinced.', 'She changed her opinion frequently.', 'She was firm in her beliefs.', 'She did not understand the arguments.'],
        correctIndex: 2,
        difficulty: 'Hard'
    },
    {
        text: 'Which sentence correctly uses "affect" and "effect"?',
        options: ['The effect of the medication did not affect him.', 'The affect of the medication did not effect him.', 'The effect of the medication did not effected him.', 'The affect of the medication did not affected him.'],
        correctIndex: 0,
        difficulty: 'Medium'
    },
    {
        text: 'What is the meaning of "transparent"?',
        options: ['Opaque', 'Translucent', 'Clear', 'Colored'],
        correctIndex: 2,
        difficulty: 'Easy'
    },
    {
        text: 'Choose the sentence with correct parallel structure.',
        options: ['She likes to run, swimming, and to jump.', 'She likes running, swimming, and jumping.', 'She likes to run, to swim, and jumping.', 'She likes running, to swim, and to jump.'],
        correctIndex: 1,
        difficulty: 'Hard'
    },
    {
        text: 'After several years of research, the scientist concluded that the data did not support the hypothesis. What can be inferred from this sentence?',
        options: ['The hypothesis was correct.', 'The scientist proved the hypothesis.', 'The data was inconclusive.', 'The hypothesis was likely incorrect based on the data.'],
        correctIndex: 3,
        difficulty: 'Medium'
    }
];


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
            isReqestingChatWithAi: false,
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
        const voiceFileId = msg.voice.file_id;
        // Forward or handle the voice file ID
        if (userState.isRequestingChat) {
            handleChatMessage(bot, chatId, `Protein_English_Bot_${voiceFileId}`, "chat");
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
                        [{text: partnerTalkOptions[1]}],
                        [{text: initQuiz}],
                        [{text: userProfile}],
                        [{text: aboutUs}]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }
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
                                [{text: partnerTalkOptions[1]}],
                                [{text: initQuiz}],
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
                        [{text: partnerTalkOptions[1]}],
                        [{text: initQuiz}],
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
    } else if (msg.video_note) {
        const videoNoteFileId = msg.video_note.file_id;
        if (userState.isRequestingChat) {
            bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
            // Use a custom identifier for handling video messages
            handleChatMessage(bot, chatId, `Protein_English_VideoM_${videoNoteFileId}`, "chat");
        } else {
            bot.forwardMessage(channelForwardName, msg.chat.id, msg.message_id)
            bot.sendMessage(chatId, wrongInput, {
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
        }
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
                        [{text: partnerTalkOptions[1]}],
                        [{text: initQuiz}],
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
                        [{text: partnerTalkOptions[1]}],
                        [{text: initQuiz}],
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
            isReqestingChatWithAi: false,
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
        // localhost:3001/findTestEnglish?idChat=584379734
        const response = await axios.get("http://localhost:3001/findTestEnglish?idChat=" + chatId);
        if (response.data.length === 0) {
            await bot.sendMessage(chatId, testFirst[0]);
            await sendCustomMessageWithText(bot, chatId, testFirst[1]);
        } else {
            userStates.set(chatId, {
                isRequestingChat: true,
            });
            await bot.sendMessage(chatId, searching, opts);
            await bot.sendMessage(chatId, searchIcon);
            await handleChatMessage(bot, chatId, text, "request");
        }
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
    } else if (text === initQuiz) {
        await sendQuestion(chatId, 0);
    } else if (text && text === partnerTalkOptions[1]) {
        userStates.set(chatId, {
            ...userState,
            isReqestingChatWithAi: true
        });
    } else if (userState.isReqestingChatWithAi) {

    } else {
        console.log("this is in the else for seeing the type of message");
        console.log(msg);
        console.log("this is in the else for seeing the type of message");
        if (userState.isRequestingChat) {
            const warningMessage = "⚠️Please send only text, voice messages, photos, videos, Sticker or Gif.⚠️";
            await bot.sendMessage(chatId, warningMessage);
        } else {
            await bot.sendMessage(chatId, wrongInput, {
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
        }
    }
});

async function sendCustomMessage(bot, chatId) {
    await bot.sendMessage(chatId, promoteUs, {
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
}

async function sendCustomMessageWithText(bot, chatId, text) {
    await bot.sendMessage(chatId, text, {
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
        await endSearchingForUser(chatId);

        // Optional: Edit the message to reflect that the search has ended
        await sendCustomMessage(bot, chatId);
    } else {
        const parts = data.split('_');
        if (parts[0] === 'answer') {
            const questionIndex = parseInt(parts[1]);
            const optionIndex = parseInt(parts[2]);
            const question = questions[questionIndex];
            const isCorrect = (optionIndex === question.correctIndex);

            // Update score
            if (!userScores.has(chatId)) {
                userScores.set(chatId, 0);
                console.log("new user score is ");
                console.log(userScores);
                console.log("new user score is ");
            }
            if (isCorrect) {
                const points = question.difficulty === 'Easy' ? 1 : (question.difficulty === 'Medium' ? 2 : 3);
                userScores.set(chatId, userScores.get(chatId) + points);
            }

            // Provide feedback on the answer
            const responseText = isCorrect ? 'Correct!' : 'Wrong answer!';
            // await bot.sendMessage(chatId, responseText);

            // Move to next question or finish the quiz
            if (questionIndex + 1 < questions.length) {
                sendQuestion(chatId, questionIndex + 1);
            } else {
                // Final score message
                const finalScore = userScores.get(chatId);
                const proficiencyLevel = finalScore >= 30 ? 'Expert' :
                    finalScore >= 20 ? 'Advanced' :
                        finalScore >= 10 ? 'Intermediate' : 'Beginner';
                await bot.deleteMessage(chatId, lastMessageId).catch(error => console.log('Error deleting message:', error));
                await bot.sendMessage(chatId, '🎉');
                await bot.sendMessage(chatId, `Quiz finished! Your score: ${finalScore}/34. You are at the ${proficiencyLevel} level.`);
                userScores.delete(chatId); // Optionally clear the score after reporting
                const object = {
                    userId: chatId,
                    level: proficiencyLevel,
                    numberOfTest: finalScore,
                }
                axios.post('http://localhost:3001/submitEnglishTest', object)
                    .then((res) => {
                        console.log("this is res");
                        bot.sendMessage(chatId, submitTest);
                    })
                    .catch((error) => {
                        console.error('Error sending data to server:', error);
                    });
            }
        }
    }
});

// Define the function that ends the searching process
async function endSearchingForUser(chatId) {
    // Your code to handle ending the search
    userStates.set(chatId, {
        isRequestingChat: false,
        isRequestingRecharge: false,
        isReqestingChatWithAi: false,
        isInvitingFriend: false,
        isRequestingEndChat: false,
        isFinalRequestImage: false,
        createLogo: false,
        size: "",
        steps: ""
    });
    await handleChatMessage(bot, chatId, "", "disconnect");

    // More logic...
}

async function sendQuestion(chatId, questionIndex) {
    // If there's a last message and it's not the first question, delete the last message
    if (lastMessageId && questionIndex > 0) {
        await bot.deleteMessage(chatId, lastMessageId).catch(error => console.log('Error deleting message:', error));
    }

    const question = questions[questionIndex];
    console.log(question);
    const options = question.options.map((option, index) => {
        return [{
            text: option,
            callback_data: `answer_${questionIndex}_${index}`  // Format: answer_questionIndex_optionIndex
        }];
    });

    // Send the new question
    const sentMessage = await bot.sendMessage(chatId, question.text, {
        reply_markup: {
            inline_keyboard: options
        }
    });

    // Update lastMessageId with the new message's ID
    lastMessageId = sentMessage.message_id;
}

