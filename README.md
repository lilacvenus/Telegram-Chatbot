# AI Assistant Telegram Bot

This project is a Telegram bot that uses the Google Generative AI API to create an AI assistant named Aspen. The assistant has a friendly, witty, and knowledgeable personality and can engage in conversations on various topics.

## Prerequisites

Before running the project, you'll need to obtain API keys for Google's Generative AI and Telegram. Follow the instructions in the respective sections below to get your API keys.

### Obtaining Google Generative AI API Key

1. Go to  https://ai.google.dev/ and click Get API key in Google AI Studio.
2. Follow the prompts until you get your API key. Copy this token for later use.

### Obtaining Telegram API Key and Setting up a Bot

1. Open the Telegram app and search for the `@BotFather` bot.
2. Start a conversation with the `@BotFather` bot and send the `/newbot` command.
3. Follow the prompts to choose a name and username for your bot.
4. The `@BotFather` will provide you with an API token for your new bot. Copy this token for later use.

## Installation

1. Clone the repository:
`git clone https://github.com/lilacvenus/Telegram-Chatbot.git`

2. Navigate to the project directory:
`cd Telegram-Chatbot`

3. Install dependencies:
`npm Install`

4. Create a `.env` file in the project root directory and add your API keys:
```
API_KEY = your_google_generative_ai_api_key
TELEGRAM_TOKEN = your_telegram_bot_token
ALLOWED_USERNAME = your_allowed_username
```

Replace `your_google_generative_ai_api_key` and `your_telegram_bot_token` with the actual API keys you obtained earlier.

## Usage

To start the Telegram bot, run the following command:
`node index.js`

The bot will start polling for messages. You can interact with the AI assistant by sending messages to the bot on Telegram.

The bot supports the following commands:

- `/start`: Greets the user and provides instructions on how to start chatting with the AI assistant.
- `/reset`: Resets the conversation history with the AI assistant.

## Configuration

You can modify the AI assistant's personality and behavior by updating the `initialPrompt` variable in the `index.js` file. Additionally, you can adjust the generation configuration and safety settings as per your requirements.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](https://github.com/lilacvenus/Telegram-Chatbot/blob/main/LICENSE).
