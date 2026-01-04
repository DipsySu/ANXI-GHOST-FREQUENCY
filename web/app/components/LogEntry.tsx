'use client';

import { useState, useEffect } from 'react';
import { LogData, Era } from '../types';
import { Play, Square } from 'lucide-react';
import { translations, Language } from '../constants/translations';

interface LogEntryProps {
  log: LogData;
  onPlayAudio: (log: LogData) => void;
  isPlaying: boolean;
  lang: Language;
}

const EraStyles: Record<Era, string> = {
  [Era.GOLDEN_AGE]:
    'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-cyan-950/20 text-cyan-100',
  [Era.TURNING_POINT]:
    'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)] bg-red-950/20 text-red-100',
  [Era.WASTELAND]:
    'border-orange-700 shadow-[0_0_10px_rgba(194,65,12,0.2)] bg-amber-950/30 text-amber-100 font-serif-sc',
  [Era.GHOST_SIGNAL]:
    'border-emerald-900 shadow-[0_0_20px_rgba(16,185,129,0.1)] bg-black text-emerald-500 font-mono tracking-widest',
};

export function LogEntry({ log, onPlayAudio, isPlaying, lang }: LogEntryProps) {
  const [glitchText, setGlitchText] = useState(log.content);
  const t = translations[lang];

  const getSignalText = (quality: string) => {
    if (quality.includes('良好') || quality.includes('High') || quality.includes('Good'))
      return t.sig_good;
    if (quality.includes('微弱') || quality.includes('Weak') || quality.includes('Low'))
      return t.sig_weak;
    if (quality.includes('损坏') || quality.includes('Damaged')) return t.sig_damaged;
    return quality;
  };

  const getSignalStyle = (quality: string) => {
    if (
      quality.includes('良好') ||
      quality.includes('High') ||
      quality.includes('Good')
    )
      return 'border-green-500 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]';
    if (
      quality.includes('微弱') ||
      quality.includes('Weak') ||
      quality.includes('Low')
    )
      return 'border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]';
    return 'border-red-500 text-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]';
  };

  const signalText = getSignalText(log.signalQuality);
  const signalStyle = getSignalStyle(log.signalQuality);

  // Ghost Signal Effect
  useEffect(() => {
    if (log.era !== Era.GHOST_SIGNAL) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const chars = log.content.split('');
        const glitchIdx = Math.floor(Math.random() * chars.length);
        const originalChar = chars[glitchIdx];
        chars[glitchIdx] = String.fromCharCode(33 + Math.floor(Math.random() * 94));
        setGlitchText(chars.join(''));

        setTimeout(() => {
          setGlitchText((prev) => {
            const newChars = prev.split('');
            newChars[glitchIdx] = originalChar;
            return newChars.join('');
          });
        }, 150);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [log.content, log.era]);

  const styles = EraStyles[log.era];

  return (
    <div
      className={`relative p-6 border-l-4 mb-8 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${styles}`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-white/10 pb-2">
        <div className="font-tech text-sm tracking-wider opacity-80">
          [{log.year} AD] :: {log.location.toUpperCase()}
        </div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <span
            className={`text-xs px-2 py-0.5 rounded border ${signalStyle}`}
          >
            SIG: {signalText}
          </span>
          <button
            onClick={() => onPlayAudio(log)}
            className="hover:text-white transition-colors"
            title="Play Audio Log"
          >
            {isPlaying ? (
              <Square size={16} className="animate-pulse" />
            ) : (
              <Play size={16} />
            )}
          </button>
        </div>
      </div>

      <div className="mb-2 text-xs font-bold uppercase opacity-70">
        FROM: {log.sender}
      </div>

      <div
        className={`text-lg leading-relaxed whitespace-pre-wrap ${
          log.era === Era.GHOST_SIGNAL ? 'blur-[0.5px]' : ''
        }`}
      >
        {log.era === Era.GHOST_SIGNAL ? glitchText : log.content}
      </div>

      {log.imageUrl && (
        <div className="mt-6 rounded-sm overflow-hidden border border-white/20 relative group">
          <img
            src={log.imageUrl}
            alt="Visual Reconstruction"
            className="w-full object-cover max-h-[400px] transition-all duration-700 opacity-90 group-hover:opacity-100 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 w-full bg-black/60 p-2 text-[10px] font-mono text-cyan-400 backdrop-blur-sm">
            {t.visual_reconstructed} {log.id.slice(0, 8)}
          </div>
        </div>
      )}

      {log.imagePrompt && (
        <div className="mt-3 p-3 bg-black/40 border border-white/10 rounded text-xs font-mono text-gray-500">
          <span className="text-cyan-600 opacity-60">IMG_PROMPT:</span> {log.imagePrompt}
        </div>
      )}

      {log.lastPost && (
        <div className="mt-4 text-xs font-mono text-gray-500 text-right italic border-t border-white/5 pt-2">
          {log.lastPost}
        </div>
      )}

      {log.era === Era.GHOST_SIGNAL && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-difference opacity-10 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] bg-cover" />
      )}
    </div>
  );
}
