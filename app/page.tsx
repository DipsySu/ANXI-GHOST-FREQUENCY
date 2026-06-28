'use client';

import { useState, useRef, useEffect } from 'react';
import { LogData, Era } from './types';
import { translations, Language } from './constants/translations';
import { Diorama } from './components/Diorama';
import { Gate } from './components/Gate';
import { LogEntry } from './components/LogEntry';

const SESSION_KEY = 'anxi_gate_unlocked';
const ERAS: Era[] = [Era.GOLDEN_AGE, Era.TURNING_POINT, Era.WASTELAND, Era.GHOST_SIGNAL];
const MEM: Record<Era, number> = { [Era.GOLDEN_AGE]: 98, [Era.TURNING_POINT]: 72, [Era.WASTELAND]: 41, [Era.GHOST_SIGNAL]: 7 };
const RULER = [640, 690, 740, 766, 790, 808];

export default function Home() {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [era, setEra] = useState<Era>(Era.GOLDEN_AGE);
  const [booted, setBooted] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [powerOn, setPowerOn] = useState(false);
  const [freq, setFreq] = useState('047.90 MHz');
  const [lang, setLang] = useState<Language>('zh');
  const [mounted, setMounted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bl = navigator.language || 'zh';
    setLang(bl.startsWith('zh') ? 'zh' : 'en');
    if (sessionStorage.getItem(SESSION_KEY)) setBooted(true);
    else setShowGate(true);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (booted && logs.length) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, booted]);

  const t = translations[lang];

  const unlock = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setBooted(true);
    setShowGate(false);
    setEra(Era.GOLDEN_AGE);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPowerOn(false);
      requestAnimationFrame(() => setPowerOn(true));
    }
  };

  const handleSearch = async (override?: string) => {
    const q = (override ?? input).trim();
    if (!q || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error('generation failed');
      const log: LogData = await res.json();
      setLogs((prev) => [...prev, log]);
      setEra(log.era);
      setFreq(('0' + (log.year / 10).toFixed(2)).slice(-6) + ' MHz');
      setInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app" data-era={era}>
      <Diorama era={showGate ? Era.GHOST_SIGNAL : era} />

      <div className={`ui${booted ? ' booted' : ''}`}>
        {/* header */}
        <header className="rig box">
          <div className="rig-top">
            <div className="seal">安</div>
            <div className="brand">
              <div className="mark">安西</div>
              <div className="tagline">{t.tagline}</div>
            </div>
            <div className="hud">
              <div className="stat">
                <span className="k">{t.mem}</span>
                <div className="row">
                  <div className="meter"><i style={{ width: `${MEM[era]}%` }} /></div>
                  <span className="pct">{MEM[era]}%</span>
                </div>
              </div>
              <button className="iconbtn" title="中 / EN" aria-label="lang" onClick={() => setLang((l) => (l === 'zh' ? 'en' : 'zh'))}>{t.lang}</button>
            </div>
          </div>
          <div className="tuner">
            {ERAS.map((e) => (
              <button key={e} className="chip" data-era={e} aria-pressed={era === e} onClick={() => setEra(e)}>
                <span className="dot" />{t.eras[e]}
              </button>
            ))}
          </div>
        </header>

        {/* hero */}
        <section className="hero">
          <div className="h-eyebrow">{t.eyebrow}</div>
          <div className="h-title">安西</div>
          <div className="h-sub">GHOST&nbsp;FREQUENCY</div>
          <div className="h-freq">
            <span>FREQ <b>{freq}</b></span>
            <span>{t.freq_loc} <b>龟兹 · SECTOR-04</b></span>
            <span>{t.freq_state} <b>{t.states[era]}</b></span>
          </div>
          <div className="h-cue"><span className="blink">▼</span> <span>{t.cue}</span></div>
        </section>

        {/* feed */}
        <main className="shaft">
          <div className="ruler" aria-hidden="true">
            {RULER.map((yr, i) => (
              <div key={yr} className="tick" style={{ top: `${8 + (i / (RULER.length - 1)) * 84}%` }}><span>{yr}</span></div>
            ))}
          </div>
          <div className="feed">
            {logs.length === 0 && <div className="empty">{t.empty}</div>}
            {logs.map((log) => <LogEntry key={log.id} log={log} lang={lang} />)}
            <div ref={endRef} />
          </div>
        </main>

        {/* drill */}
        <footer className="drill">
          <div className="drill-row">
            <div className="field">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t.input_placeholder}
                disabled={loading}
              />
              <span className="caret">{loading ? '◜◝◞◟' : t.ready}</span>
            </div>
            <button className="btn" onClick={() => handleSearch()} disabled={loading || !input.trim()}>
              ⛏ <span className="t">{t.dig}</span>
            </button>
          </div>
          <div className="drill-meta">
            <span>{t.conn}</span>
            <span><a onClick={() => { sessionStorage.removeItem(SESSION_KEY); setBooted(false); setShowGate(true); }}>{t.replay}</a> &nbsp;·&nbsp; {t.loss}</span>
          </div>
        </footer>
      </div>

      {mounted && showGate && <Gate onUnlock={unlock} lang={lang} />}
      <div className={`crt-on${powerOn ? ' run' : ''}`} aria-hidden="true" />
      <div className="scan" aria-hidden="true" />
    </div>
  );
}
