const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
require('dotenv').config();

const API_KEY = process.env.GOLD_API_KEY;

function getGoldSpot() {
  const response = fetch('https://api.metals.dev/v1/metal/spot?api_key=${API_KEY}&metal=gold&currency=USD');

  const data = await response.json();

  return data.rate.price;
}



// 1. Initialize Discord Bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
    if (msg.content.toLowerCase() === '!ping') { msg.reply('Pong! 🏓'); }
    if (msg.content.toLowerCase() === '!goldprice') { msg.reply(getGoldSPot()); }
});

client.login(process.env.DISCORD_TOKEN);

// 2. Initialize Express Web Server (Required for Render)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => { res.send('Discord bot is alive and running!'); });
app.get('/ping', (req, res) => { res.send('Pong! 🏓'); });
app.get('/goldprice', (req, res) => { res.send(getGoldSPot()); });

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
