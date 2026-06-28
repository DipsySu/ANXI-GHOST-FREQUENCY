'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import { LogData, Era } from './types';
import { translations, Language } from './constants/translations';
import { Gate } from './components/Gate';
import { Tuner } from './components/Tuner';
import { AmbientField } from './components/AmbientField';
import { ReadingSlip } from './components/ReadingSlip';

const SESSION_KEY = 'anxi_gate_unlocked';
const ERAS: Era[] = [Era.GOLDEN_AGE, Era.TURNING_POINT, Era.WASTELAND, Era.GHOST_SIGNAL];
const MEM: Record<Era, number> = { [Era.GOLDEN_AGE]: 96, [Era.TURNING_POINT]: 72, [Era.WASTELAND]: 38, [Era.GHOST_SIGNAL]: 13 };
const ACCENT: Record<Era, [number, number, number]> = {
  [Era.GOLDEN_AGE]: [58, 208, 192], [Era.TURNING_POINT]: [255, 106, 94], [Era.WASTELAND]: [217, 138, 55], [Era.GHOST_SIGNAL]: [53, 232, 154],
};
const CORRUPT: Record<Era, number> = { [Era.GOLDEN_AGE]: 0, [Era.TURNING_POINT]: 0.28, [Era.WASTELAND]: 0.6, [Era.GHOST_SIGNAL]: 1 };
const TAB: Record<Era, string> = { [Era.GOLDEN_AGE]: '#3ad0c0', [Era.TURNING_POINT]: '#ff6a5e', [Era.WASTELAND]: '#d98a37', [Era.GHOST_SIGNAL]: '#35e89a' };
const ERA_START: Record<Era, number> = { [Era.GOLDEN_AGE]: 744, [Era.TURNING_POINT]: 756, [Era.WASTELAND]: 775, [Era.GHOST_SIGNAL]: 798 };
const ERA_RANGE: Record<Era, string> = { [Era.GOLDEN_AGE]: '640–750', [Era.TURNING_POINT]: '751–760', [Era.WASTELAND]: '761–790', [Era.GHOST_SIGNAL]: '791–808' };

function eraOf(year: number): Era {
  if (year <= 750) return Era.GOLDEN_AGE;
  if (year <= 760) return Era.TURNING_POINT;
  if (year <= 790) return Era.WASTELAND;
  return Era.GHOST_SIGNAL;
}
const freqOf = (year: number) => ('00' + (year / 10).toFixed(2)).slice(-6);
const sigN = (m: number) => (m >= 70 ? 3 : m >= 35 ? 2 : 1);
const tabVar = (c: string) => ({ ['--tab']: c } as CSSProperties);

export default function Home() {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [active, setActive] = useState<LogData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [year, setYear] = useState(744);
  const [booted, setBooted] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Language>('zh');

  useEffect(() => {
    setLang((navigator.language || 'zh').startsWith('zh') ? 'zh' : 'en');
    if (sessionStorage.getItem(SESSION_KEY)) setBooted(true);
    else setShowGate(true);
    setMounted(true);
  }, []);

  const t = translations[lang];
  const era = active ? active.era : eraOf(year);
  const mem = active ? MEM[active.era] : MEM[era];
  const lowmem = mem <= 25;
  const sigLabel = (m: number) => (m >= 70 ? t.sig_good : m >= 35 ? t.sig_weak : t.sig_damaged);

  const unlock = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setBooted(true);
    setShowGate(false);
    setYear(744);
    setActive(null);
  };

  const dig = async (override?: string) => {
    const q = (override ?? input).trim() || String(year);
    if (loading) return;
    setLoading(true);
    setError(null);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 60000);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error('generation failed');
      const log: LogData = await res.json();
      setLogs((prev) => [...prev.filter((l) => l.id !== log.id), log]);
      setActive(log);
      setYear(log.year);
      setInput('');
    } catch (e) {
      console.error(e);
      setError(t.err);
    } finally {
      clearTimeout(to);
      setLoading(false);
    }
  };

  return (
    <div className={`app${booted ? ' booted' : ''}${lowmem ? ' lowmem' : ''}`} data-era={era}>
      <div className="cube">
        <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />

        {/* header */}
        <header className="bar">
          <div className="bar-l">
            <div className="seal">安</div>
            <div className="brand">
              <div className="mark">安西 · 鬼频</div>
              <div className="sub">{t.tagline}</div>
            </div>
          </div>
          <div className="bar-r">
            <span className="status"><i className="led" /> {t.net} <b>{t.net_on}</b></span>
            <span className="status">{t.bao} <b>{lowmem ? t.bao_silent : t.bao_ok}</b></span>
            <span className="mem">
              <span className="lbl">{t.mem} · MEM</span>
              <span className="track"><span className="fill" style={{ width: `${mem}%` }} /></span>
              <span className="pct">{mem}%</span>
            </span>
            <button className="langbtn" onClick={() => setLang((l) => (l === 'zh' ? 'en' : 'zh'))} aria-label="中 / EN">{t.lang}</button>
          </div>
        </header>

        {active ? (
          /* ===================== reading view ===================== */
          <>
            <div className="strip">
              <span className="sk">频率刻度 {'//'} POS</span>
              <span className="mini">
                <span className="zones">{ERAS.map((e) => <i key={e} style={{ flex: 1, background: `rgba(${ACCENT[e].join(',')},.4)` }} />)}</span>
                <span className="head" style={{ left: `${((active.year - 640) / 168) * 100}%` }} />
              </span>
              <span className="pos">{active.year} AD · {t.eras[active.era]}</span>
              <button className="retune" onClick={() => setActive(null)}>↺ {t.retune}</button>
            </div>
            <ReadingSlip key={active.id} log={active} lang={lang} mem={mem} corrupt={CORRUPT[active.era]} accent={ACCENT[active.era]} />
          </>
        ) : (
          /* ===================== tune view ===================== */
          <>
            <div className="eras">
              {ERAS.map((e) => (
                <button key={e} className="era-tab" aria-pressed={eraOf(year) === e} style={tabVar(TAB[e])} onClick={() => setYear(ERA_START[e])}>
                  <span className="dot" /> {t.eras[e]} <span className="yr">{ERA_RANGE[e]}</span>
                </button>
              ))}
            </div>

            <div className="screen">
              <AmbientField accent={ACCENT[era]} intensity={0.32 + CORRUPT[era] * 0.4} />
              <div className="inner hero">
                <div className="eyebrow">{t.eyebrow}</div>
                <div className="title-wrap">
                  <span className="gtitle">
                    <span className="base">安西</span>
                    <span className="g r" aria-hidden="true">安西</span>
                    <span className="g b" aria-hidden="true">安西</span>
                  </span>
                </div>
                <div className="h-sub">GHOST&nbsp;FREQUENCY</div>
                <p className="intro">{t.intro}</p>
                <div className="cue"><span className="blink">▸</span> {t.cue}</div>
              </div>
              <div className="preview">
                <div className="pk"><i className="led" /> {t.caught}</div>
                <div className="py">{year} AD <small>· 龟兹 · SECTOR-04</small></div>
                <div className="pf">{t.eras[era]} · {t.states[era]}</div>
                <div className="pa">[ {t.dig} ⏎ / {t.scrub} ]</div>
              </div>
            </div>

            <div className="readout">
              <div className="cell"><div className="k">FREQ</div><div className="v accent">{freqOf(year)} <small>MHz</small></div></div>
              <div className="cell"><div className="k">YEAR</div><div className="v">{year} <small>AD · {t.states[era]}</small></div></div>
              <div className="cell"><div className="k">POS</div><div className="v">龟兹 · SECTOR-04</div></div>
              <div className="cell"><div className="k">SIG</div><div className="v accent"><span className="sigbars">{[0, 1, 2].map((i) => <i key={i} style={{ height: (i + 1) * 4 + 2, opacity: i < sigN(mem) ? 1 : 0.25 }} />)}</span>{sigLabel(mem)}</div></div>
            </div>

            <Tuner year={year} onScrub={setYear} />

            <div className="dig">
              <div className="hint">{t.dig_hint}</div>
              <button className="navbtn" onClick={() => setYear((y) => Math.max(640, y - 1))} aria-label="−1">◂</button>
              <div className="field-in">
                <input
                  value={input}
                  onChange={(e) => { setInput(e.target.value); if (error) setError(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && dig()}
                  placeholder={t.input_placeholder}
                  aria-label={t.input_placeholder}
                  disabled={loading}
                />
                <span className="caret">{loading ? '◜◝◞◟' : t.ready}</span>
              </div>
              <button className="navbtn" onClick={() => setYear((y) => Math.min(808, y + 1))} aria-label="+1">▸</button>
              <button className="dig-btn" onClick={() => dig()} disabled={loading}>⛏ <span className="t">{t.dig_signal}</span></button>
            </div>
            {error && <div className="drill-err" role="alert">{error}</div>}
          </>
        )}

        {/* archive · strata */}
        <div className="archive">
          <span className="ak">{t.archive} {'//'} ARCHIVE</span>
          {logs.length === 0 ? (
            <span className="empty">{t.archive_empty}</span>
          ) : (
            <span className="chips">
              {logs.map((l) => (
                <button key={l.id} className="arch-chip" aria-current={active?.id === l.id} style={tabVar(TAB[l.era])} onClick={() => { setActive(l); setYear(l.year); }}>
                  <span className="d" /> {l.year} {t.eras[l.era]}
                </button>
              ))}
            </span>
          )}
        </div>

        {/* device footer */}
        <div className="footline">
          <span>黑立方终端 · HEILIFANG {'//'} {t.net} {t.net_on}端</span>
          <span>型号 开元-I型 · 龟兹 SECTOR-04 · <button className="lnk" onClick={() => { sessionStorage.removeItem(SESSION_KEY); setBooted(false); setShowGate(true); setActive(null); setLogs([]); }}>{t.replay}</button></span>
        </div>
      </div>

      {mounted && showGate && <Gate onUnlock={unlock} lang={lang} />}
      <div className="scan" aria-hidden="true" />
    </div>
  );
}
