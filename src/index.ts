import { Client, GatewayIntentBits, Message, TextChannel } from "discord.js";
import express, { Request, Response } from "express";
import dotenv from "dotenv";

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
  note?: string;
}

function generatePassword(
  length?: number,
  allowNumbers?: boolean,
  allowLetters?: boolean,
  specialCharacters?: string,
): PasswordResult {
  let error: string | undefined;
  let charset: string | undefined;
  let note: string | undefined;

  if (allowLetters === true) {
    if (charset === undefined) {
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    } else {
      charset += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
  }

  if (allowNumbers === true) {
    if (charset === undefined) {
      charset = "0123456789";
    } else {
      charset += "0123456789";
    }
  }

  if (specialCharacters && specialCharacters.length > 0) {
    if (charset === undefined) {
      charset = specialCharacters;
    } else {
      charset += specialCharacters;
    }
  }

  if (length === undefined) {
    if (error === undefined) {
      error = "Length must be provided.";
    } else {
      error += "Length must be provided.";
    }
  }
  if (length === 0) {
    if (error === undefined) {
      error = "Length must be greater than 0.";
    } else {
      error += "Length must be greater than 0.";
    }
  }
  if (charset === undefined) {
    if (error === undefined) {
      error = "Character set must be provided.";
    } else {
      error += "Character set must be provided.";
    }
  }
  if (charset != undefined && charset.length === 0) {
    if (error === undefined) {
      error = "Characters set length must be greater than 0.";
    } else {
      error += "Characters set length must be greater than 0.";
    }
  }

  if (error != undefined) {
    return { success: false, error: error };
  }
  
  const result = splitDuplicates(charset);
  if (result.duplicates.length > 0) 
  { if (note === undefined) 
        { note = "Duplicate characters (" + result.duplicates + ") found. Duplicates removed.";} 
  else  { note += "Duplicate characters (" + result.duplicates + ") found. Duplicates removed." ;}
  }
charset = result.cleaned;
  


  let password = "";
  if (length != undefined && charset != undefined) {
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
  }

  return {
    success: true,
    password,
    combinations:
      charset === undefined || length === undefined
        ? undefined
        : charset.length ** length,
    charset,
    possibleCharacters: charset === undefined ? undefined : charset.length,
    allowLetters,
    allowNumbers,
    length,
    specialCharacters: specialCharacters, //?? 'undefined' //use specialCharacters defined and not null; else 'undefined'
    note: note
  };
}

interface GoldApiResponse {
  rate?: {
    price?: number;
  };
}

function splitDuplicates(input: string | undefined): {
  duplicates: string;
  cleaned: string;
} {
  const seen = new Set<string>();
  const duplicateChars = new Set<string>();

  let cleaned = "";
  
  for (const char of input ?? "") {
    if (seen.has(char)) {
      duplicateChars.add(char);
    } else {
      seen.add(char);
      cleaned += char;
    }
  }

  return {
    duplicates: Array.from(duplicateChars).join(""),
    cleaned
  };
}

async function getGoldSpot(): Promise<number | undefined> {
  if (!API_KEY) {
    throw new Error("GOLD_API_KEY is not configured");
  }

  const response = await fetch(
    `https://api.metals.dev/v1/metal/spot?api_key=${API_KEY}&metal=gold&currency=USD`,
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
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content === "!ping") {
    await message.reply("Pong! 🏓");
    return;
  }

  if (content === "!goldprice") {
    const { channel } = message;

    // Type guard: Ensures the bot has permission and the channel can receive messages
    if (!channel.isSendable()) return;

    try {
      const price = await getGoldSpot();
      await channel.send(`Gold price: $${price}/toz`);
    } catch (err) {
      console.error(err);
      await channel.send("Failed to fetch gold price.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

// --------------------
// Express Routes
// --------------------

app.get("/", (_req: Request, res: Response) => {
  res.send("Discord bot is alive and running!");
});

app.get("/ping", (_req: Request, res: Response) => {
  res.send("Pong! 🏓");
});

app.post("/generate-password", (req: Request, res: Response) => {
  const result = generatePassword(
    req.body.length,
    req.body.allowNumbers,
    req.body.allowLetters,
    req.body.specialCharacters,
  );

  res.json(result);
});

app.get("/generate-password", (req: Request, res: Response) => {
  let pwlen: number | undefined =
    req.query.length === undefined ? undefined : Number(req.query.length);
  let alnum: boolean | undefined =
    req.query.allowNumbers === undefined
      ? undefined
      : Boolean(req.query.allowNumbers);
  let allet: boolean | undefined =
    req.query.allowLetters === undefined
      ? undefined
      : Boolean(req.query.allowLetters);
  let sc: string | undefined =
    req.query.specialCharacters === undefined
      ? undefined
      : String(req.query.specialCharacters);

  const result = generatePassword(pwlen, alnum, allet, sc);

  res.json(result);
});

app.get("/goldprice", async (_req: Request, res: Response) => {
  try {
    const price = await getGoldSpot();

    res.json({
      "Gold price": `$${price}/toz`,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch gold price",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
