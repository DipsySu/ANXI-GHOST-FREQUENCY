import { LogData } from '../types';

export const generateLog = async (query: string): Promise<LogData> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform or validate if necessary, pretty much direct map now
    return {
      ...data,
      id: data.id || crypto.randomUUID(), // ensure ID
    };

  } catch (error) {
    console.error("API generation error:", error);
    throw error;
  }
};

// Placeholder for TTS, if we want to keep it or move to backend later
// For now, let's keep it as is, or disable it if we don't have a backend TTS endpoint distinct from the main one.
// The original code called Google API directly for TTS. 
// If we want to keep using the browser's ability or the original key, we'd need that key in FE.
// But we moved logic to backend.
// Let's just mock it or leave it empty for now to avoid cross-origin/key issues if we don't pass the key.
export const generateSpeech = async (text: string, era: any): Promise<string> => {
  console.warn("TTS temporarily disabled in API migration");
  return "";
};