'use client';

import { useEffect, useState } from 'react';
import { LogData } from '../types';
import { translations, Language } from '../constants/translations';
import { portraitFor, sceneFor } from '../constants/assets';
import { AmbientField } from './AmbientField';

function sigInfo(q: string, t: typeof translations['zh']) {
  if (q.includes('良好') || /good/i.test(q)) return { cls: 'sig-good', n: 3, label: t.sig_good };
  if (q.includes('微弱') || /weak|connect/i.test(q)) return { cls: 'sig-weak', n: 2, label: t.sig_weak };
  return { cls: 'sig-bad', n: 1, label: t.sig_damaged };
}

const POOL = '天宝开元安西龟兹陇右沙狼漏油义体量子幽灵铁锈▮▯░▒█0123#%*'.split('');
const MARKS = '█▓░▒';

/** Gentle, deterministic decay — replace a fraction of glyphs with redaction blocks so a
 *  late-era transmission reads as damaged but stays legible. */
function corruptText(text: string, corrupt: number): string {
  if (corrupt <= 0) return text;
  const frac = corrupt * 0.12;
  const ch = [...text];
  let seed = 0;
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < ch.length; i++) {
    if (ch[i] !== '\n' && ch[i] !== ' ' && rnd() < frac) ch[i] = MARKS[(rnd() * MARKS.length) | 0];
  }
  return ch.join('');
}

/** "Decoding transmission" — scramble then resolve, ending on the (decayed) text.
 *  Keyed by log id at the call site, so init state is fresh per transmission and the
 *  reduced-motion path needs no synchronous setState in the effect. */
function useDecode(text: string, corrupt: number) {
  const [out, setOut] = useState(() => corruptText(text, corrupt));
  const [done, setDone] = useState(true);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // init already holds the resolved text
    const ch = [...text];
    const dur = Math.min(1100, 360 + ch.length * 7);
    let raf = 0;
    let start = 0;
    const f = (now: number) => {
      if (!start) { start = now; setDone(false); }
      const p = Math.min(1, (now - start) / dur);
      const rv = Math.floor(p * ch.length);
      let o = '';
      for (let i = 0; i < ch.length; i++) o += ch[i] === '\n' ? '\n' : i < rv ? ch[i] : POOL[(Math.random() * POOL.length) | 0];
      setOut(o);
      if (p < 1) raf = requestAnimationFrame(f);
      else { setOut(corruptText(text, corrupt)); setDone(true); }
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [text, corrupt]);
  return { out, done };
}

export function ReadingSlip({ log, lang, mem, corrupt, accent }: {
  log: LogData; lang: Language; mem: number; corrupt: number; accent: [number, number, number];
}) {
  const t = translations[lang];
  const s = sigInfo(log.signalQuality, t);
  const portrait = portraitFor(log.sender);
  const scene = log.imageUrl || sceneFor(log.era, log.id);
  const { out, done } = useDecode(log.content, corrupt);
  const low = mem <= 25;

  return (
    <div className="slip" data-era={log.era}>
      <AmbientField accent={accent} intensity={0.25 + corrupt * 0.5} />
      <div className="sl-in">
        <div className="slip-head">
          <div className="sigil">
            {portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={portrait} alt={log.sender} />
            ) : '報'}
          </div>
          <div className="slip-id">
            <div className="yr">{log.year} AD</div>
            <div className="loc">▸ {log.location}</div>
            <div className="from">{t.from} · <b>{log.sender}</b></div>
          </div>
          <div className="slip-meta">
            <span className={`sig ${s.cls}`}>
              SIG <span className="bars">{[0, 1, 2].map((i) => <i key={i} style={{ height: (i + 1) * 3 + 2, opacity: i < s.n ? 1 : 0.25 }} />)}</span> {s.label}
            </span>
            <span className={`memline${low ? ' low' : ''}`}>
              {t.mem} <span className="track"><span className="fill" style={{ width: `${mem}%` }} /></span> <b>{mem}%</b>
            </span>
          </div>
        </div>

        <div className="decoding">{done ? `// ${t.decoded}` : `⌁⌁ ${t.decoding}…`}</div>

        <div className="slip-body">{out}</div>

        <div className="slip-visual">
          <div className="vk">{t.visual}</div>
          <div className="frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={scene} alt="" loading="lazy" />
            <span className="vscan" aria-hidden="true" />
          </div>
          <div className="vcap">{t.eras[log.era]} · 8-BIT</div>
        </div>

        <div className="slip-foot">
          <span>{t.net} · {t.conn} · {done ? t.decoded : t.decoding}</span>
          {log.lastPost && <span className="post">{log.lastPost}</span>}
        </div>
      </div>
    </div>
  );
}
