import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const API_KEY = process.env.GOLD_API_KEY;
const PORT = Number(process.env.PORT) || 3000;

interface PasswordResult {
  success: boolean;
  password?: string;
  combinations?: number;
  charset?: string;
  possibleCharacters?: number;
  allowLetters?: boolean;
  allowNumbers?: boolean;
  length?: number;
  specialCharacters?: string;
  error?: string;
}

function generatePassword(length?: number, allowNumbers?: boolean, allowLetters?: boolean, specialCharacters?: string): PasswordResult 
{
  let error = null;
  let charset = null;

  if (allowLetters) {
    (charset === null ? "" : charset) += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }

  if (allowNumbers) {
    (charset === null ? "" : charset) += '0123456789';
  }

  if (specialCharacters && specialCharacters.length > 0) {
    (charset === null ? "" : charset) += specialCharacters;
  }

  if (length === null) { if (error === null) {error = "Length must be provided.";} else {error += "Length must be provided.";} }
  if (length === 0) { if (error === null) {error = "Length must be greater than 0.";} else {error += "Length must be greater than 0.";} }
  if (charset === null) { if (error === null) {error = "Character set must be provided.";} else {error += "Character set must be provided.";} }
  if (charset.length === 0) { if (error === null) {error = "Characters set length must be greater than 0.";} else {error += "Characters set length must be greater than 0."";} }

  if error != null { return { success: false,  error: error }; }
  
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return {
    success: true,
    password,
    combinations: charset.length ** length,
    charset,
    possibleCharacters: charset.length,
    allowLetters,
    allowNumbers,
    length,
    specialCharacters: specialCharacters ?? 'undefined'
  };
}

interface GoldApiResponse {
  rate?: {
    price?: number;
  };
}

async function getGoldSpot(): Promise<number | undefined> {
  if (!API_KEY) {
    throw new Error('GOLD_API_KEY is not configured');
  }

  const response = await fetch(
    `https://api.metals.dev/v1/metal/spot?api_key=${API_KEY}&metal=gold&currency=USD`
  );

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = (await response.json()) as GoldApiResponse;

  return data.rate?.price;
}

// --------------------
// Discord Bot
// --------------------

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content === '!ping') {
    await message.reply('Pong! 🏓');
    return;
  }

  if (content === '!goldprice') {
    const { channel } = message;
    
    // Type guard: Ensures the bot has permission and the channel can receive messages
    if (!channel.isSendable()) return;

    try {
      const price = await getGoldSpot();
      await channel.send(`Gold price: $${price}/toz`);
    } catch (err) {
      console.error(err);
      await channel.send('Failed to fetch gold price.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

// --------------------
// Express Routes
// --------------------

app.get('/', (_req: Request, res: Response) => {
  res.send('Discord bot is alive and running!');
});

app.get('/ping', (_req: Request, res: Response) => {
  res.send('Pong! 🏓');
});

app.post('/generate-password', (req: Request, res: Response) => {

  const result = generatePassword(req.body.length, req.body.allowNumbers, req.body.allowLetters, req.body.specialCharacters);

  res.json(result);
  
});

app.get('/generate-password', (req: Request, res: Response) => {

  const result = generatePassword(req.query.length, req.query.allowNumbers === 'true', req.query.allowLetters === 'true', req.query.specialCharacters);

  res.json(result);
  
});

app.get('/goldprice', async (_req: Request, res: Response) => {
  try {
    const price = await getGoldSpot();

    res.json({
      'Gold price': `$${price}/toz`
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch gold price'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
