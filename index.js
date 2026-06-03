const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
require('dotenv').config();

// 1. Initialize Discord Bot
const client = new Client({
    intents: [
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
    if (msg.content.toLowerCase() === '!ping') {
        msg.reply('Pong!');
    }
});

client.login(process.env.DISCORD_TOKEN);

// 2. Initialize Express Web Server (Required for Render)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Discord bot is alive and running!');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
