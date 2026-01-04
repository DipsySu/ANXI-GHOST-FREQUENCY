export enum Era {
  GOLDEN_AGE = 'GOLDEN_AGE', // 640-750
  TURNING_POINT = 'TURNING_POINT', // 755-760
  WASTELAND = 'WASTELAND', // 760-790
  GHOST_SIGNAL = 'GHOST_SIGNAL', // 790-808
}

export interface LogData {
  id: string;
  year: number;
  location: string;
  sender: string;
  signalQuality: '良好' | '微弱' | '严重损坏';
  content: string;
  era: Era;
  audioBase64?: string; // Cache for TTS
  imageUrl?: string;
  lastPost?: string;
}

export interface EraConfig {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    accent: string;
  };
}