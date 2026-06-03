require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

// Initialize the client with specific gateway intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Run this logic once when the bot successfully logs in
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for incoming chat messages
client.on('messageCreate', (message) => {
    // Ignore messages sent by bots to avoid loops
    if (message.author.bot) return;

    // Simple reply logic
    if (message.content.toLowerCase() === 'ping') {
        message.reply('Pong!');
    }
});

// Authenticate and log in the bot using the token
client.login(process.env.DISCORD_TOKEN);
