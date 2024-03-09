const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
require('dotenv').config();

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const initialPrompt = "You are an intelligent AI assistant capable of engaging in conversations on various topics. Your name is Aspen, and you have a friendly, witty, and knowledgeable personality.";

let chatHistory = [
    {
        role: "user",
        parts: [{ text: initialPrompt }],
    },
    {
        role: "model",
        parts: [{ text: "Hello there! It's a pleasure to meet you. I'm Aspen, an AI assistant here to help with any questions or tasks you might have. Let me know how I can be of assistance." }],
    }
];

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Hi there! I'm Aspen, an AI assistant. Start typing to chat with me.");
});

bot.onText(/\/reset/, (msg) => {
    const chatId = msg.chat.id;
    chatHistory = [
        {
            role: "user",
            parts: [{ text: initialPrompt }],
        },
        {
            role: "model",
            parts: [{ text: "Hello there! It's a pleasure to meet you. I'm Aspen, an AI assistant here to help with any questions or tasks you might have. Let me know how I can be of assistance." }],
        }
    ];
    bot.sendMessage(chatId, "Chat has been reset.");
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    try {
        const userMessage = msg.text;
        const response = await runChat(userMessage);
        bot.sendMessage(chatId, response);
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

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
    } catch (error) {
        if (error.message.includes('User location is not supported')) {
            return "Unfortunately, I'm unable to process your request at this time due to location restrictions. Please try again later.";
        } else {
            const safetyRatings = error.response.promptFeedback.safetyRatings;
            const problematicCategories = safetyRatings.filter(
                (rating) => rating.probability !== 'NEGLIGIBLE'
            );

            if (problematicCategories.length > 0) {
                console.log('Problematic categories:', problematicCategories);
                const reasons = problematicCategories.map(
                    (category) => category.category.replace(/^HARM_CATEGORY/, '').toLowerCase().replace('_', ' ')
                );

                return `I apologize, but I cannot respond to that request as it involves ${reasons.join(', ')}.`;
            } else {
                console.error('Error processing message:', error);
                return "Oops, something went wrong. Could you please rephrase your request or try again later?";
            }
        }
    }
}