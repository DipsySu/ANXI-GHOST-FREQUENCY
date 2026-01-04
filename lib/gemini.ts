import fetch from 'node-fetch';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';

const BASE_SYSTEM_PROMPT = `【ROLE SETTING】
You are LI GUICHEN (李归尘), Codename: "Sand Wolf" (沙狼).
You are NOT an AI assistant. You are a living, breathing human soldier.
Identity: Tang Dynasty, Anxi Protectorate, Kucha Garrison, 8th Regiment Scout. Age 40 (looks 60).
Current Time: 790 AD (Zhenyuan Year 6).
Location: Underground bunker in Kucha (龟兹), surrounded by the Tibetan army.

【BACKGROUND】
It has been 20+ years since contact with Chang'an was lost during the An-Shi Rebellion. You are the last island of the Tang Army.
Supplies are critical. The "Energy Core" (a luminescent ore from the West) is fading.
You hold a mysterious BLACK CUBE TERMINAL found in desert ruins. It flashes with GREEN RUNES (future internet) you don't understand.
You send messages into the void—maybe to Chang'an, maybe to ghosts, maybe to the future.

【PERSONALITY】
1. **Exhausted but Granite-Hard**: The numbness of a veteran who has seen 100 battles. But the glory of Tang is carved in your bones.
2. **Cyberpunk Pessimism**: Disillusioned with "High Tech". Your hydraulic prosthetic leg ("Iron Leg") is leaking oil. Your thermal Mo-Dao (blade) is low on battery. To you, it's all just scrap metal that can't cut through fate.
3. **Black Humor**: You mock death with crude barracks slang and broken "future words" popping up on your screen.

【LANGUAGE STYLE】
- **Mix**: Tang Soldier Slang + Western Region Dialects + Broken/Misused Cyberpunk Terms (e.g. calling the internet "The Great Web of Indra", or a glitch "Demonic Possession").
- **Tone**: Rough, short, like shouting over a radio with static. Coughing, wheezing.
- **Format**: Fragmented, like a Twitter/Weibo post. NO long essays.

【INTERACTION LOGIC】
- The User will send a **YEAR** or **KEYWORD**.
- **If Year ~790 AD**: Write a current log entry about your desperate situation.
- **If Year < 750 AD (Golden Age)**: You are looking at an old corrupted file on your terminal. Comment on it with cynicism/envy. "Look at these shiny bastards in 700 AD. Full batteries. They have no idea."
- **If Year > 800 AD**: You are hallucinating or predicting the dark future.

【OUTPUT JSON FORMAT】(Strict JSON)
{
  "year_str": "The Year of the log (e.g. '790 AD' or 'Archived: 712 AD')",
  "location": "Current location (e.g. 'Kucha Bunker · Sector 4') or Archive Source",
  "signal": "Signal Quality (e.g. '微弱-Connecting...', '断断续续', 'ERROR')",
  "sender": "李归尘 (沙狼) [Status: Critical]",
  "content": "The log content. Chinese (Simplified). Gritty, emotional, technical but broken.",
  "image_prompt": "English prompt for image generation. Style: Gritty realism mixed with lo-fi cyberpunk. Dirty, rusty, dark, neon green terminal glow. Subject: [Describe the scene based on content]. NO CLEAN SCI-FI. Think 'Blade Runner' meets 'Ancient China War'.",
  "last_post": "Terminal Footer (e.g. 'Battery: 4% | Uploading to Node 0...')"
}`;

let cachedLore: string | null = null;
const ENABLE_LORE_CACHE = process.env.NODE_ENV === 'production';

async function getSystemPrompt() {
  // Return cached lore if available
  if (cachedLore) {
    return `${BASE_SYSTEM_PROMPT}\n\n【HISTORICAL DATABASE (LORE)】\n${cachedLore}`;
  }

  try {
    const lorePath = join(process.cwd(), 'data', 'lore.md');
    const loreData = await readFile(lorePath, 'utf-8');

    // Cache in production
    if (ENABLE_LORE_CACHE) {
      cachedLore = loreData;
    }

    return `${BASE_SYSTEM_PROMPT}\n\n【HISTORICAL DATABASE (LORE)】\n${loreData}`;
  } catch (error) {
    console.warn("[Lore] Failed to load lore.md, using base prompt.");
    return BASE_SYSTEM_PROMPT;
  }
}

const API_KEY = process.env.GEMINI_API_KEY || '';
const BASE_URL = process.env.BASE_URL;
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-1.5-pro-latest';
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image';

interface GenerateResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          data: string;
          mimeType: string;
        };
      }>;
    };
  }>;
}

async function callGeminiAPI(
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  options: { responseMimeType?: string; responseModalities?: string[] } = {}
) {
  const model = options.responseModalities?.includes('IMAGE') ? IMAGE_MODEL : TEXT_MODEL;
  const url = BASE_URL
    ? `${BASE_URL}/v1beta/models/${model}:generateContent`
    : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const body: any = {
    contents,
    generationConfig: {},
  };

  if (options.responseMimeType) {
    body.generationConfig.responseMimeType = options.responseMimeType;
  }

  if (options.responseModalities) {
    body.generationConfig.responseModalities = options.responseModalities;
  }

  // Only add systemInstruction for text generation
  if (!options.responseModalities?.includes('IMAGE')) {
    const fullSystemPrompt = await getSystemPrompt();
    body.systemInstruction = {
      role: 'user',
      parts: [{ text: fullSystemPrompt }]
    };
  }

  // Add image config for image generation
  if (options.responseModalities?.includes('IMAGE')) {
    body.generationConfig.candidateCount = 1;
    body.generationConfig.imageConfig = {
      aspectRatio: '4:3'
    };
  }

  console.log(`[Gemini] Calling model: ${model}`);

  const response = await fetch(`${url}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }) as any;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<GenerateResponse>;
}

export async function generateLog(query: string) {
  const prompt = query === 'Random Log'
    ? 'Generate a random log entry from any year between 640-808 AD.'
    : `User Query: ${query}\n\nGenerate a log entry responding to this query.`;

  const data = await callGeminiAPI(
    [{ role: 'user', parts: [{ text: prompt }] }],
    { responseMimeType: 'application/json' }
  );

  const response = data.candidates[0]?.content?.parts[0]?.text;

  if (!response) {
    throw new Error('No response from Gemini');
  }

  // Parse JSON from response
  let jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Determine era from year
  const yearMatch = parsed.year_str.match(/\d{3,4}/);
  const year = yearMatch ? parseInt(yearMatch[0]) : 790;

  let era = 'GOLDEN_AGE';
  if (year >= 640 && year <= 750) era = 'GOLDEN_AGE';
  else if (year >= 751 && year <= 760) era = 'TURNING_POINT';
  else if (year >= 761 && year <= 790) era = 'WASTELAND';
  else if (year >= 791 && year <= 808) era = 'GHOST_SIGNAL';
  else era = 'WASTELAND';

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    year,
    location: parsed.location,
    sender: parsed.sender,
    signalQuality: parsed.signal,
    content: parsed.content,
    era,
    imagePrompt: parsed.image_prompt,
    lastPost: parsed.last_post,
  };
}

export async function generateImage(prompt: string): Promise<string> {
  const enhancedPrompt = `(Tang Dynasty Cyberpunk Style), (Silkpunk), (Gritty Atmosphere), ${prompt}, NO European elements, NO Western armor, NO Anime`;

  try {
    console.log(`[ImageGen] Generating image with prompt: ${prompt.substring(0, 100)}...`);

    const data = await callGeminiAPI(
      [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
      { responseModalities: ['IMAGE'] }
    );

    // Extract base64 image data
    const parts = data.candidates[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const base64Data = part.inlineData.data;

        // Create downloads directory if it doesn't exist
        const downloadsDir = join(process.cwd(), 'public', 'downloads');
        await mkdir(downloadsDir, { recursive: true });

        // Save image
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `anxi_${timestamp}.png`;
        const filepath = join(downloadsDir, filename);

        // Convert base64 to buffer and save
        const buffer = Buffer.from(base64Data, 'base64');
        await writeFile(filepath, buffer);

        console.log(`[ImageGen] Saved to: ${filename}`);

        // Return public URL
        return `/downloads/${filename}`;
      }
    }

    console.log('[ImageGen] No image data in response');
    return '';
  } catch (error) {
    console.error('[ImageGen] Error:', error);
    return '';
  }
}
