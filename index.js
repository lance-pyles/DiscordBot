const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Render requires a web server to keep the service active
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Discord Bot is running!');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Initialize Discord Bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});

// Replace with your bot token
client.login('MTUxMTU2NTk5MTY1NjgxNjY3MA.G2EaBd.i04GvXVU6190ENrUmtDl0cI-EpYmiEAOnm04SY');
