'use client';

import { useEffect, useState } from 'react';
import { LogData } from '../types';
import { translations, Language } from '../constants/translations';
import { portraitFor, sceneFor } from '../constants/assets';

function sigInfo(q: string, t: typeof translations['zh']) {
  if (q.includes('良好') || q.includes('Good')) return { cls: 'sig-good', n: 3, label: t.sig_good };
  if (q.includes('微弱') || q.includes('Weak')) return { cls: 'sig-weak', n: 2, label: t.sig_weak };
  return { cls: 'sig-bad', n: 1, label: t.sig_damaged };
}

/** "Decoding transmission" — scramble then resolve the text on mount. */
function useDecode(text: string): string {
  const [out, setOut] = useState(text);
  useEffect(() => {
    // text is stable per log (append-only), so the initial state already holds it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pool = '天宝开元安西龟兹陇右沙狼漏油义体量子幽灵铁锈▮▯░▒█0123#%*'.split('');
    const ch = [...text];
    const dur = Math.min(900, 320 + ch.length * 6);
    const start = performance.now();
    let raf = 0;
    const f = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const rv = Math.floor(p * ch.length);
      let o = '';
      for (let i = 0; i < ch.length; i++) {
        const c = ch[i];
        o += c === '\n' ? '\n' : i < rv ? c : pool[(Math.random() * pool.length) | 0];
      }
      setOut(o);
      if (p < 1) raf = requestAnimationFrame(f); else setOut(text);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return out;
}

export function LogEntry({ log, lang }: { log: LogData; lang: Language }) {
  const t = translations[lang];
  const era = log.era;
  const s = sigInfo(log.signalQuality, t);
  const portrait = portraitFor(log.sender);
  const scene = log.imageUrl || sceneFor(era, log.id);
  const body = useDecode(log.content);

  return (
    <article className="tablet box" data-era={era}>
      <span className="cartouche">{t.eras[era]}</span>
      <i className="cnr tl" /><i className="cnr tr" /><i className="cnr bl" /><i className="cnr br" />
      <div className="t-head">
        <div className="t-headl">
          {portrait && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="portrait" src={portrait} alt={log.sender} />
          )}
          <div>
            <div className="t-id">{log.year} AD</div>
            <div className="t-loc">▸ {log.location}</div>
          </div>
        </div>
        <span className={`signal ${s.cls}`}>
          SIG <span className="bars">{[0, 1, 2].map((i) => (
            <i key={i} style={{ height: (i + 1) * 3 + 2, opacity: i < s.n ? 1 : 0.22 }} />
          ))}</span> {s.label}
        </span>
      </div>
      <div className="t-from">{t.from}: <b>{log.sender}</b></div>
      <div className="dialog">
        <div className="body">{body}</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="scene" src={scene} alt="" loading="lazy" />
      </div>
      <div className="scene-cap">{`${t.visual} // ${era}`}</div>
      {log.lastPost && <div className="t-foot">{log.lastPost}</div>}
    </article>
  );
}
