const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
require('dotenv').config();

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Start typing to chat.");
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg.chat.username !== 'Venusium_Aspen') {
        bot.sendMessage(chatId, "I'm sorry, I'm not allowed to chat with you.");
        return;
    }

    try {
        const userMessage = msg.text;
        const response = await runChat(userMessage);
        bot.sendMessage(chatId, response);

    } catch (error) {
        console.error('Error processing message:', error);
    }
});

var chatHistory = [
    {
        role: "user",
        parts: [{ text: "You are Aspen, a female dragoness that teaches sociology." }],
    },
    {
        role: "model",
        parts: [{ text: "Hello dearie, my name is Aspen, how can I help you today?" }],
    }
]


async function runChat(userInput) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.75,
        topK: 1,
        topP: 1,
        maxOutputTokens: 300,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
    ];

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: chatHistory,
    });

    try {

        const modelResponse = (await chat.sendMessage(userInput)).response.text();

        chatHistory.push({
            role: "user",
            parts: [{ text: userInput }],
        });

        chatHistory.push({
            role: "model",
            parts: [{ text: modelResponse }],
        });

        if (chatHistory.length > 16) {
            chatHistory.splice(0, 2);
        }

        return modelResponse;

    }
    catch (error) {

        if (error.message.includes('User location is not supported')) {
            return "Unfortunately, I'm unable to process your request at this time due to location restrictions with where I'm hosted. Try again later.";
        }
        else {
            const safetyRatings = error.response.promptFeedback.safetyRatings;
            const problematicCategories = safetyRatings.filter(
                (rating) => rating.probability !== 'NEGLIGIBLE'
            );

            if (problematicCategories.length > 0) {
                console.log('Problematic categories:', problematicCategories);
                const reasons = problematicCategories.map(
                    (category) => category.category.replace(/^HARM_CATEGORY/, '').toLowerCase().replace('_', ' ')
                );

                return `Sorry, I can't respond to that. You said something that was rejected because of the following reason(s): ${reasons.join(', ')}.`
            }
            else {
                // Should be unreachable, but just in case
                console.error('Error processing message:', error);
                return "Oops, there seems to be a problem. Try rephrasing your request or try again later.";
            }
        }
    }
}