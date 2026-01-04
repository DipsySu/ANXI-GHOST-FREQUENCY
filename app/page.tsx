'use client';

import { useState, useRef, useEffect } from 'react';
import { LogData, Era } from './types';
import { LogEntry } from './components/LogEntry';
import { CRTOverlay } from './components/CRTOverlay';
import { Search, RotateCw, Terminal, Languages, Database } from 'lucide-react';
import { translations, Language } from './constants/translations';

// Background styles
const EraBackgrounds: Record<Era, string> = {
  [Era.GOLDEN_AGE]: 'bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900',
  [Era.TURNING_POINT]: 'bg-gradient-to-br from-neutral-900 via-red-950 to-neutral-900',
  [Era.WASTELAND]: 'bg-[#1a1510]',
  [Era.GHOST_SIGNAL]: 'bg-black',
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentEra, setCurrentEra] = useState<Era>(Era.GOLDEN_AGE);

  // Auto-detect language (client-side only to avoid hydration mismatch)
  const [lang, setLang] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  const endOfLogsRef = useRef<HTMLDivElement>(null);

  // Detect language on mount
  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0] || 'en';
    setLang(browserLang.startsWith('zh') ? 'zh' : 'en');
    setMounted(true);
  }, []);

  const t = translations[lang];

  // Auto-scroll to new logs
  useEffect(() => {
    if (mounted) {
      endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, mounted]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'zh' : 'en'));
  };

  const handleSearch = async (overrideQuery?: string) => {
    if (loading) return;
    const q = overrideQuery || query;
    if (!q.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const newLog = await response.json();
      setLogs((prev) => [...prev, newLog]);
      setCurrentEra(newLog.era);
      setQuery('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (log: LogData) => {
    // TODO: Implement audio playback
    console.log('Play audio for:', log.id);
  };

  return (
    <div
      className={`h-screen overflow-hidden text-gray-200 transition-colors duration-1000 flex flex-col relative ${EraBackgrounds[currentEra]}`}
    >
      <CRTOverlay />

      {/* Header */}
      <header className="flex-none border-b border-white/10 bg-black/40 backdrop-blur-sm z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded border border-white/10 animate-pulse">
              <Terminal size={20} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="font-tech text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold">
                {mounted ? t.title : 'ANXI GHOST FREQUENCY'}
              </h1>
              <p className="text-[10px] text-gray-500 tracking-[0.2em] font-mono">
                {mounted ? t.subtitle : 'TIMELINE 640-808 AD // PARALLEL UNIVERSE'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="p-1 hover:text-cyan-400 transition-colors"
              title="Switch Language"
            >
              <Languages size={16} />
            </button>
            <div className="hidden md:flex items-center gap-4 text-xs font-mono text-gray-500">
              <span>
                SYS_STATUS:{' '}
                <span className="text-green-500">{t.status_online}</span>
              </span>
              <span>
                {t.mem_integrity}: 34%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 z-30 relative overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
            <Database size={48} className="text-cyan-600 mb-4" />
            <h2 className="font-serif-sc text-2xl">{t.welcome_title}</h2>
            <p className="max-w-md text-sm font-mono">
              {t.welcome_desc}
              <br />
              {t.data_range}
            </p>
          </div>
        )}

        <div className="space-y-4 pb-4">
          {logs.map((log) => (
            <LogEntry
              key={log.id}
              log={log}
              lang={lang}
              onPlayAudio={handlePlayAudio}
              isPlaying={false}
            />
          ))}
          {loading && (
            <div className="p-6 border-l-4 border-gray-700 bg-black/20 text-gray-400 font-mono text-xs animate-pulse">
              {t.loading_quantum}
              <br />
              {t.loading_decrypt}
              <br />
              {t.loading_audio}
            </div>
          )}
          <div ref={endOfLogsRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="flex-none bg-black/80 backdrop-blur-md border-t border-white/10 p-4 z-40">
        <div className="max-w-4xl mx-auto flex gap-2 md:gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSearch()}
              placeholder={t.input_placeholder}
              className="w-full bg-white/5 border border-white/20 text-cyan-300 px-4 py-3 rounded-none focus:outline-none focus:border-cyan-500 font-mono placeholder:text-gray-600 focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-wait"
              disabled={loading}
            />
            <div className="absolute right-3 top-3.5 text-xs text-gray-600 font-mono pointer-events-none hidden md:block">
              {t.cursor_active}
            </div>
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-cyan-900/50 border border-cyan-700 text-cyan-400 hover:bg-cyan-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-tech text-sm flex items-center gap-2"
          >
            <Search size={16} />
            <span className="hidden md:inline">{t.btn_retrieve}</span>
          </button>

          <button
            onClick={() => handleSearch('Random Log')}
            disabled={loading}
            className="px-4 py-2 bg-transparent border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-all font-tech text-sm flex items-center gap-2"
            title="Random Access"
          >
            <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="max-w-4xl mx-auto mt-2 text-[10px] text-gray-600 font-mono flex justify-between">
          <span>{t.connection_encrypted}</span>
          <span>
            {t.data_loss}: 99.8%
          </span>
        </div>
      </footer>
    </div>
  );
}
