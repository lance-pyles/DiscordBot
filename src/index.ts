import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;

/* -------------------- TYPES -------------------- */

interface PasswordResult {
  success: boolean;
  password: string | null;
  combinations: number | null;
  combinationsFormatted: number | null;
  charset: string | null;
  possibleCharacters: number | null;
  allowLetters: boolean | null;
  allowNumbers: boolean | null;
  length: number | null;
  specialCharacters: string | null;
  error: string | null;
  note: string | null;
}

/* -------------------- HELPERS -------------------- */

function splitDuplicates(input: string): {
  duplicates: string[];
  cleaned: string;
} {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  let cleaned = "";

  for (const char of input) {
    if (seen.has(char)) {
      duplicates.add(char);
    } else {
      seen.add(char);
      cleaned += char;
    }
  }

  return {
    duplicates: [...duplicates],
    cleaned,
  };
}

/* -------------------- CORE LOGIC -------------------- */

function generatePassword(
  length?: number,
  allowNumbers?: boolean,
  allowLetters?: boolean,
  specialCharacters?: string
): PasswordResult {
  let charset = "";
  let error: string | null = null;
  let note: string | null = null;

  if (!length || length <= 0) {
    return {
      success: false,
      password: null,
      combinations: null,
      combinationsFormatted: null,
      charset: null,
      possibleCharacters: null,
      allowLetters: allowLetters ?? null,
      allowNumbers: allowNumbers ?? null,
      length: length ?? null,
      specialCharacters: specialCharacters ?? null,
      error: "Length must be provided and greater than 0.",
      note: null,
    };
  }

  if (allowLetters) {
    charset += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  if (allowNumbers) {
    charset += "0123456789";
  }

  if (specialCharacters) {
    charset += specialCharacters;
  }

  if (!charset) {
    return {
      success: false,
      password: null,
      combinations: null,
      combinationsFormatted: null,
      charset: null,
      possibleCharacters: null,
      allowLetters: allowLetters ?? null,
      allowNumbers: allowNumbers ?? null,
      length,
      specialCharacters: specialCharacters ?? null,
      error: "Character set must be provided.",
      note: null,
    };
  }

  const { duplicates, cleaned } = splitDuplicates(charset);
  charset = cleaned;

  if (duplicates.length > 0) {
    note = `Duplicate characters (${duplicates.join(
      ""
    )}) found. Duplicates removed.`;
  }

  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return {
    success: true,
    password,
    combinations: Math.pow(charset.length, length),
    combinationsFormatted: formatCombinations(Math.pow(charset.length, length)),
    charset,
    possibleCharacters: charset.length,
    allowLetters: allowLetters ?? null,
    allowNumbers: allowNumbers ?? null,
    length,
    specialCharacters: specialCharacters ?? null,
    error: null,
    note,
  };
}
function formatCombinations(value: number | null): string | null {
  if (value === null) return null;

  // 1 billion or more → scientific notation
  if (value >= 1_000_000_000) {
    return value.toExponential(2); // e.g. 1.23e+9
  }

  // otherwise → comma formatting
  return value.toLocaleString("en-US");
}
/* -------------------- ROUTES -------------------- */

app.post("/generate-password", (req: Request, res: Response) => {
  const result = generatePassword(
    req.body.length,
    req.body.allowNumbers,
    req.body.allowLetters,
    req.body.specialCharacters
  );

  res.json(result);
});

app.get("/generate-password", (req: Request, res: Response) => {
  const length =
    req.query.length !== undefined ? Number(req.query.length) : undefined;

  const allowNumbers =
    req.query.allowNumbers === "true"
      ? true
      : req.query.allowNumbers === "false"
      ? false
      : undefined;

  const allowLetters =
    req.query.allowLetters === "true"
      ? true
      : req.query.allowLetters === "false"
      ? false
      : undefined;

  const specialCharacters =
    typeof req.query.specialCharacters === "string"
      ? req.query.specialCharacters
      : undefined;

  const result = generatePassword(
    length,
    allowNumbers,
    allowLetters,
    specialCharacters
  );

  res.json(result);
});

/* -------------------- SERVER -------------------- */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
