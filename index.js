const { Client, GatewayIntentBits } = require('discord.js');

require('dotenv').config();

// NOTE: In Node 18+, fetch is global. If you're on older Node, you'd need node-fetch.

const express = require('express');
const app = express();
app.use(express.json());

const API_KEY = process.env.GOLD_API_KEY;

function generatePassword(length, allowNumbers, allowLetters) {
    let charset = '';

    if (allowLetters) {
        charset += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }

    if (allowNumbers) {
        charset += '0123456789';
    }

    if (!charset.length) {
        return {
            success: false,
            error: 'At least one character type must be enabled.'
        };
    }

    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    combinations = charset.length ** length
    return {
        success: true,
        password: password,
        combinations: combinations,
        charset: charset
    };
}

// --------------------
// Gold price function
// --------------------
async function getGoldSpot() {
  const response = await fetch(
    `https://api.metals.dev/v1/metal/spot?api_key=${API_KEY}&metal=gold&currency=USD`
  );

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();

  return data?.rate?.price;
}

// --------------------
// Discord Bot Setup
// --------------------
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

client.on('messageCreate', async (message) => {
  // ignore bot messages
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content === '!ping') {
    return message.reply('Pong! 🏓');
  }

  if (content === '!goldprice') {
    try {
      const price = await getGoldSpot();
      return message.channel.send(`Gold price: $${price}/toz`);
    } catch (err) {
      console.error(err);
      return message.channel.send('Failed to fetch gold price.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

// --------------------
// Express Server Setup
// --------------------
//const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Discord bot is alive and running!');
});

app.get('/ping', (req, res) => {
  res.send('Pong! 🏓');
});

app.get('/generate-password', (req, res) => {
    const length = parseInt(req.query.length, 10) || 12;
    const allowNumbers = req.query.allowNumbers ?? req.body.allowNumbers === 'true';
    const allowLetters = req.query.allowLetters ?? req.body.allowLetters === 'true';

    const result = generatePassword(
        length,
        allowNumbers,
        allowLetters
    );

    res.json(result);
});

app.get('/goldprice', async (req, res) => {
  try {
    const price = await getGoldSpot();
    res.json({ 'Gold price': `$${price}/toz` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gold price' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
