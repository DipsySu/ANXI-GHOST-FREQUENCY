'use client';

import { useState, useEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { LogData, Era } from './types';
import { translations, Language } from './constants/translations';
import { Gate } from './components/Gate';
import { Tuner } from './components/Tuner';
import { AmbientField } from './components/AmbientField';
import { ReadingSlip } from './components/ReadingSlip';
import { DIG_SITES, randomDigSite, type DigSite } from './constants/sites';
import { demoLog } from './constants/demo';

const SESSION_KEY = 'anxi_gate_unlocked';
// session persistence is best-effort: private mode / blocked storage throws SecurityError,
// which must never stop the gate/unlock UI from progressing.
const safeGet = (k: string): string | null => { try { return sessionStorage.getItem(k); } catch { return null; } };
const safeSet = (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } };
const safeRemove = (k: string) => { try { sessionStorage.removeItem(k); } catch { /* ignore */ } };
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
  const [site, setSite] = useState<DigSite>(DIG_SITES[0]);
  const [demo, setDemo] = useState(false);
  const [errorDev, setErrorDev] = useState<string | null>(null);
  const digSeq = useRef(0);
  const digAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    setSite(randomDigSite());
    setLang((navigator.language || 'zh').startsWith('zh') ? 'zh' : 'en');
    // ?demo[=year|keyword]: offline seed mode — skips the gate and (with a value) opens that
    // transmission immediately, so design/QA can reach the reading view without a Gemini key.
    const demoVal = new URLSearchParams(window.location.search).get('demo');
    const isDemo = demoVal !== null;
    setDemo(isDemo);
    if (isDemo || safeGet(SESSION_KEY)) setBooted(true);
    else setShowGate(true);
    if (isDemo && demoVal && !/^(1|true)$/i.test(demoVal)) {
      const log = demoLog(demoVal, 744);
      setLogs([log]); setActive(log); setYear(log.year);
    }
    setMounted(true);
  }, []);

  // lock page scroll while the excavation gate is up
  useEffect(() => {
    if (!showGate) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showGate]);

  const t = translations[lang];
  const era = active ? active.era : eraOf(year);
  const mem = active ? MEM[active.era] : MEM[era];
  const lowmem = mem <= 25;
  const sigLabel = (m: number) => (m >= 70 ? t.sig_good : m >= 35 ? t.sig_weak : t.sig_damaged);

  // invalidate any in-flight dig so a late response can't write stale state back over a reset
  const cancelDig = () => { digSeq.current++; digAbort.current?.abort(); digAbort.current = null; setLoading(false); };

  const unlock = () => {
    cancelDig();
    setBooted(true);
    setShowGate(false);
    setYear(744);
    setActive(null);
    safeSet(SESSION_KEY, '1'); // best-effort; never blocks the unlock
  };

  const dig = async (override?: string) => {
    const q = (override ?? input).trim() || String(year);
    if (loading) return;
    const seq = ++digSeq.current; // generation guard: a reset/replay bumps this to disown this run
    setLoading(true);
    setError(null);
    setErrorDev(null);

    // offline seed mode (?demo=1): synthesize a transmission so the reading view is
    // reachable without a Gemini key or any network call — for design / QA.
    if (demo) {
      await new Promise((r) => setTimeout(r, 280));
      if (digSeq.current !== seq) return; // superseded by replay/unlock while we waited
      const log = demoLog(q, year);
      setLogs((prev) => [...prev.filter((l) => l.id !== log.id), log]);
      setActive(log);
      setYear(log.year);
      setInput('');
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();
    digAbort.current = ctrl;
    const to = setTimeout(() => ctrl.abort(), 60000);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
        signal: ctrl.signal,
      });
      if (digSeq.current !== seq) return; // superseded — don't write stale state
      if (!res.ok) {
        // the API attaches a `dev` diagnostic outside production (e.g. missing GEMINI_API_KEY)
        let dev = '';
        try { dev = (await res.json())?.dev ?? ''; } catch {}
        const err = new Error('generation failed') as Error & { dev?: string };
        err.dev = dev;
        throw err;
      }
      const log: LogData = await res.json();
      if (digSeq.current !== seq) return; // superseded
      setLogs((prev) => [...prev.filter((l) => l.id !== log.id), log]);
      setActive(log);
      setYear(log.year);
      setInput('');
    } catch (e) {
      if (digSeq.current !== seq) return; // superseded (includes abort from cancelDig)
      console.error(e);
      setError(t.err);
      const dev = (e as { dev?: string })?.dev;
      if (dev) setErrorDev(dev);
    } finally {
      clearTimeout(to);
      if (digSeq.current === seq) { setLoading(false); digAbort.current = null; }
    }
  };

  const handleDigKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
    e.preventDefault();
    dig();
  };

  return (
    <div className={`app${booted ? ' booted' : ''}${lowmem ? ' lowmem' : ''}`} data-era={era}>
      <div className="cube" inert={showGate || undefined}>
        <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />

        {/* header */}
        <header className="bar">
          <div className="bar-l">
            <div className="seal">安</div>
            <div className="brand">
              <div className="mark">安西 · 失落频率</div>
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
              <span className="sk">地下频带 {'//'} FIELD POS</span>
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
                <div className="h-sub">LOST&nbsp;FREQUENCY</div>
                <div className="cmd"><b>{t.cmd1}</b><span className="sep">▸</span><b>{t.cmd2}</b><span className="sep">▸</span><b>{t.cmd3}</b></div>
                <div className="brief"><span className="tag">{t.brief_tag}</span> {t.brief}</div>
              </div>
              <div className="preview">
                <div className="pk"><i className="led" /> {t.caught}</div>
                <div className="py">{year} AD <small>· {site.name} · {site.code}</small></div>
                <div className="pf">{t.eras[era]} · {t.states[era]}</div>
                <div className="pa">[ {t.lock_action} ]</div>
              </div>
            </div>

            <div className="readout">
              <div className="cell"><div className="k">FREQ</div><div className="v accent">{freqOf(year)} <small>MHz</small></div></div>
              <div className="cell"><div className="k">YEAR</div><div className="v">{year} <small>AD · {t.states[era]}</small></div></div>
              <div className="cell"><div className="k">FIELD</div><div className="v">{site.name} · {site.depth}</div></div>
              <div className="cell"><div className="k">SIG</div><div className="v accent"><span className="sigbars">{[0, 1, 2].map((i) => <i key={i} style={{ height: (i + 1) * 4 + 2, opacity: i < sigN(mem) ? 1 : 0.25 }} />)}</span>{sigLabel(mem)}</div></div>
            </div>

            <Tuner
              year={year}
              onScrub={setYear}
              logs={logs}
              activeId={null}
              onPick={(id) => { const l = logs.find((x) => x.id === id); if (l) { setActive(l); setYear(l.year); } }}
              eraNames={t.eras}
              depthText={`${t.depth} ${site.depth}`}
              label={t.strata}
            />

            <div className="dig">
              <div className="hint">{t.dig_hint}</div>
              <button className="navbtn" onClick={() => setYear((y) => Math.max(640, y - 1))} aria-label="−1">◂</button>
              <div className="field-in">
                <input
                  value={input}
                  onChange={(e) => { setInput(e.target.value); if (error) { setError(null); setErrorDev(null); } }}
                  onKeyDown={handleDigKeyDown}
                  placeholder={t.input_placeholder}
                  aria-label={t.input_placeholder}
                  disabled={loading}
                />
                <span className="caret">{loading ? '◜◝◞◟' : t.ready}</span>
              </div>
              <button className="navbtn" onClick={() => setYear((y) => Math.min(808, y + 1))} aria-label="+1">▸</button>
              <button className="dig-btn" onClick={() => dig()} disabled={loading}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="px" src="/sprites/ui_pickaxe.png" alt="" /> <span className="t">{t.dig_signal}</span>
              </button>
            </div>
            {error && <div className="drill-err" role="alert">{error}{errorDev && <span className="dev">{errorDev}</span>}</div>}
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
          <span>黑立方残片 · LOST-FREQ NODE {'//'} {t.net} {t.net_on}</span>
          <span>发掘点 {site.code} · {site.mark} · <button className="lnk" onClick={() => { cancelDig(); safeRemove(SESSION_KEY); setSite(randomDigSite()); setBooted(false); setShowGate(true); setActive(null); setLogs([]); }}>{t.replay}</button></span>
        </div>
      </div>

      {/* mobile-only sticky recover bar — keeps the dig action in the thumb zone */}
      {booted && !active && (
        <div className="mfab">
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); if (error) { setError(null); setErrorDev(null); } }}
            onKeyDown={handleDigKeyDown}
            placeholder={t.input_placeholder}
            aria-label={t.input_placeholder}
            disabled={loading}
          />
          <button onClick={() => dig()} disabled={loading} aria-label={t.dig_signal}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="px" src="/sprites/ui_pickaxe.png" alt="" /> {t.dig}
          </button>
        </div>
      )}

      {mounted && showGate && <Gate onUnlock={unlock} lang={lang} site={site} />}
      <div className="scan" aria-hidden="true" />
    </div>
  );
}
