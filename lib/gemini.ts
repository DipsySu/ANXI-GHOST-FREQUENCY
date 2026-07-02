import { readFile } from 'fs/promises';
import { join } from 'path';
import { lookup as dnsLookup } from 'dns';
import { Agent as HttpsAgent } from 'https';
import fetch from 'node-fetch';
import { GoogleGenAI } from '@google/genai';
import { buildLifeDetailPrompt } from './life-detail-cards';

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
  } catch {
    console.warn("[Lore] Failed to load lore.md, using base prompt.");
    return BASE_SYSTEM_PROMPT;
  }
}

const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
const BASE_URL = process.env.BASE_URL;
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
const GEMINI_API_HOST = 'generativelanguage.googleapis.com';
const GEMINI_API_HOST_IP = process.env.GEMINI_API_HOST_IP?.trim();

const geminiFetchAgent = GEMINI_API_HOST_IP
  ? new HttpsAgent({
      lookup(hostname, options, callback) {
        if (hostname === GEMINI_API_HOST) {
          const family = GEMINI_API_HOST_IP.includes(':') ? 6 : 4;

          if (options.all) {
            callback(null, [{ address: GEMINI_API_HOST_IP, family }], family);
            return;
          }

          callback(null, GEMINI_API_HOST_IP, family);
          return;
        }

        dnsLookup(hostname, options, callback);
      },
    })
  : undefined;

// Control which API method to use
// - If BASE_URL is set, force use fetch (for proxy/relay)
// - Otherwise, use USE_GEMINI_SDK env var (default: true for SDK, false for fetch)
const USE_SDK = BASE_URL
  ? false
  : process.env.USE_GEMINI_SDK !== 'false';

if (process.env.NODE_ENV !== 'production') console.log(`[Gemini] Using ${USE_SDK ? 'SDK' : 'REST API (fetch)'} mode`);

// ============================================================================
// METHOD 1: REST API with fetch (for proxy/relay services)
// ============================================================================

interface GenerateResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
    blockReasonMessage?: string;
  };
}

async function callViaFetch(
  model: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  options: { responseMimeType?: string; systemInstruction?: string }
) {
  // Use official Google API if no BASE_URL, otherwise use proxy
  const baseUrl = BASE_URL || 'https://generativelanguage.googleapis.com';
  const url = `${baseUrl}/v1beta/models/${model}:generateContent`;

  const body: {
    contents: typeof contents;
    generationConfig: {
      responseMimeType?: string;
    };
    systemInstruction?: { role: string; parts: Array<{ text: string }> };
  } = {
    contents,
    generationConfig: {},
  };

  if (options.responseMimeType) {
    body.generationConfig.responseMimeType = options.responseMimeType;
  }

  // Only add systemInstruction for text generation
  if (options.systemInstruction) {
    body.systemInstruction = {
      role: 'user',
      parts: [{ text: options.systemInstruction }]
    };
  }

  // API key goes in the header only — keep it out of the URL so it isn't captured by proxy/access logs
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    agent: geminiFetchAgent,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<GenerateResponse>;
}

// ============================================================================
// METHOD 2: Official Google AI SDK (for direct API access)
// ============================================================================

async function callViaSDK(
  model: string,
  userPrompt: string,
  options: { responseMimeType?: string; systemInstruction?: string }
): Promise<GenerateResponse> {
  // The client automatically gets API key from GEMINI_API_KEY env var
  const ai = new GoogleGenAI({});

  console.log(`[Gemini SDK] Calling model: ${model}`);

  // Build request parameters (shape is driven by the @google/genai SDK)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestParams: any = {
    model,
    contents: userPrompt,
  };

  // Add response config
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = {};
  if (options.responseMimeType) {
    config.responseMimeType = options.responseMimeType;
  }
  if (options.systemInstruction) {
    config.systemInstruction = options.systemInstruction;
  }
  if (Object.keys(config).length > 0) {
    requestParams.config = config;
  }

  const response = await ai.models.generateContent(requestParams);
  const responseObj = response as unknown as GenerateResponse;

  // Extract text
  let fullText = '';

  if (response.text) {
    fullText = response.text;
  }

  // Return in the same format as fetch
  const candidate: NonNullable<GenerateResponse['candidates']>[number] = {
    content: {
      parts: []
    },
  };

  const finishReason = responseObj.candidates?.[0]?.finishReason;
  if (finishReason) {
    candidate.finishReason = finishReason;
  }

  if (fullText) {
    candidate.content.parts.push({ text: fullText });
  }

  return { candidates: [candidate], promptFeedback: responseObj.promptFeedback };
}

// ============================================================================
// Unified API
// ============================================================================

async function callGeminiAPI(
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  options: { responseMimeType?: string } = {}
) {
  const systemInstruction = await getSystemPrompt();

  // Extract user prompt from contents (for SDK mode)
  const userPrompt = contents[contents.length - 1]?.parts[0]?.text || '';

  if (USE_SDK) {
    return await callViaSDK(TEXT_MODEL, userPrompt, {
      responseMimeType: options.responseMimeType,
      systemInstruction
    });
  } else {
    return await callViaFetch(TEXT_MODEL, contents, {
      responseMimeType: options.responseMimeType,
      systemInstruction
    });
  }
}

function pickString(record: Record<string, unknown>, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }

  return fallback;
}

function pickYear(record: Record<string, unknown>, query: string) {
  const yearText = pickString(record, ['year_str', 'yearStr', 'year', 'date', 'archive_year'], query);
  const yearMatch = yearText.match(/\d{3,4}/) || query.match(/\d{3,4}/);
  const parsedYear = yearMatch ? parseInt(yearMatch[0], 10) : 790;

  return Math.max(640, Math.min(808, Number.isFinite(parsedYear) ? parsedYear : 790));
}

function describeGeminiEmptyResponse(data: GenerateResponse) {
  const blockReason = data.promptFeedback?.blockReason;
  const blockMessage = data.promptFeedback?.blockReasonMessage;
  const finishReason = data.candidates?.[0]?.finishReason;
  const details = [blockReason && `blockReason=${blockReason}`, blockMessage, finishReason && `finishReason=${finishReason}`]
    .filter(Boolean)
    .join(' · ');

  return details ? `No text response from Gemini (${details})` : 'No text response from Gemini';
}

export async function generateLog(query: string) {
  const lifeDetailPrompt = buildLifeDetailPrompt(query);
  const jsonContract = `Return one strict JSON object only. Use these exact snake_case keys: year_str, location, signal, sender, content, image_prompt, last_post. Do not rename keys to camelCase.`;
  const prompt = query === 'Random Log'
    ? `Generate a random log entry from any year between 640-808 AD.\n\n${lifeDetailPrompt}\n\n${jsonContract}`
    : `User Query: ${query}\n\n${lifeDetailPrompt}\n\nGenerate a log entry responding to this query.\n\n${jsonContract}`;

  const data = await callGeminiAPI(
    [{ role: 'user', parts: [{ text: prompt }] }],
    { responseMimeType: 'application/json' }
  );

  const response = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!response) {
    throw new Error(describeGeminiEmptyResponse(data));
  }

  // Parse JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Determine era from year — clamp to the archive's range (640–808) so the UI dial/readout stay valid
  const parsedRecord = parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
  const year = pickYear(parsedRecord, query);

  let era = 'GOLDEN_AGE';
  if (year >= 640 && year <= 750) era = 'GOLDEN_AGE';
  else if (year >= 751 && year <= 760) era = 'TURNING_POINT';
  else if (year >= 761 && year <= 790) era = 'WASTELAND';
  else if (year >= 791 && year <= 808) era = 'GHOST_SIGNAL';
  else era = 'WASTELAND';

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    year,
    location: pickString(parsedRecord, ['location', 'place', 'archive_source'], '龟兹地下掩体 · 未标注区'),
    sender: pickString(parsedRecord, ['sender', 'from'], '李归尘 (沙狼) [Status: Critical]'),
    signalQuality: pickString(parsedRecord, ['signal', 'signalQuality', 'signal_quality'], '微弱-Connecting...'),
    content: pickString(parsedRecord, ['content', 'message', 'log', 'text'], '信号残缺。黑立方只吐出一行乱码。'),
    era,
    imagePrompt: pickString(parsedRecord, ['image_prompt', 'imagePrompt', 'image'], 'Gritty Tang Dynasty cyberpunk bunker, old Anxi soldier, green terminal glow, dusty ancient Chinese frontier'),
    lastPost: pickString(parsedRecord, ['last_post', 'lastPost', 'footer'], 'Battery: --% | Signal corrupted'),
  };
}
