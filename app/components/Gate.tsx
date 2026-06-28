'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { translations, Language } from '../constants/translations';
import { RELICS } from '../constants/assets';

const KINDS = [RELICS.coin, RELICS.chip, RELICS.jade];
const POS = [{ x: 0.26, y: 0.4 }, { x: 0.7, y: 0.46 }, { x: 0.46, y: 0.66 }];

type Relic = { x: number; y: number; found: boolean; visible: boolean };

export function Gate({ onUnlock, lang }: { onUnlock: () => void; lang: Language }) {
  const t = translations[lang];
  const soilRef = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const [relics, setRelics] = useState<Relic[]>(() => POS.map((p) => ({ ...p, found: false, visible: false })));
  const [gone, setGone] = useState(false);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const collected = relics.filter((r) => r.found).length;
  const allFound = relics.length > 0 && collected === relics.length;

  // paint the data-quicksand: dark noise soil with buried site markings
  useEffect(() => {
    const canvas = soilRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0d0b08'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 2800; i++) {
      const x = Math.random() * W, y = Math.random() * H, s = Math.random() * 3 + 1;
      ctx.fillStyle = Math.random() > 0.5 ? '#211c14' : '#050505'; ctx.fillRect(x, y, s, s);
    }
    ctx.fillStyle = '#1c1810'; ctx.font = '16px ui-monospace,monospace';
    ctx.fillText('ANOMALY_DETECTED', W * 0.16, H * 0.3);
    ctx.fillText('SECTOR_7 // 龟兹', W * 0.62, H * 0.78);
  }, []);

  // reveal any relic whose soil has been scraped thin enough to see through
  const checkReveal = useCallback(() => {
    const canvas = soilRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    setRelics((prev) => {
      let changed = false;
      const next = prev.map((r) => {
        if (r.found || r.visible) return r;
        const a = ctx.getImageData(r.x * window.innerWidth * dpr, r.y * window.innerHeight * dpr, 1, 1).data[3];
        if (a < 40) { changed = true; return { ...r, visible: true }; }
        return r;
      });
      return changed ? next : prev;
    });
  }, []);

  const erase = useCallback((cx: number, cy: number) => {
    const canvas = soilRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.save(); ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    checkReveal();
  }, [checkReveal]);

  const collect = useCallback((i: number) => {
    setRelics((prev) => {
      const r = prev[i];
      if (!r || r.found || !r.visible) return prev;
      return prev.map((x, j) => (j === i ? { ...x, found: true } : x));
    });
  }, []);

  // keyboard path: excavate (reveal + collect) a relic without the pointer scrape
  const excavate = useCallback((i: number) => {
    setRelics((prev) => (prev[i] && !prev[i].found ? prev.map((x, j) => (j === i ? { ...x, visible: true, found: true } : x)) : prev));
  }, []);

  // move focus into the gate when it opens (cube is inert behind it)
  useEffect(() => { skipRef.current?.focus(); }, []);

  // once every relic is recovered, run the boot sequence then hand off
  useEffect(() => {
    if (!allFound) return;
    let t2: ReturnType<typeof setTimeout>;
    const t1 = setTimeout(() => {
      setGone(true);
      t2 = setTimeout(onUnlock, reduce ? 100 : 450);
    }, reduce ? 300 : 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [allFound, onUnlock, reduce]);

  return (
    <div className={`gate${gone ? ' gone' : ''}`}>
      <button ref={skipRef} className="gate-skip" onClick={() => { setGone(true); setTimeout(onUnlock, reduce ? 50 : 300); }}>{t.skip}</button>
      <div className="gate-hint">{t.gate_hint}<b>{t.gate_hint2}</b></div>
      {/* keyboard-accessible excavation: hidden until focused, then operable by Enter/Space */}
      <div className="gate-kbd">
        {relics.map((r, i) => !r.found && (
          <button key={i} onClick={() => excavate(i)}>{t.kbd_relic} {i + 1} / {relics.length}</button>
        ))}
      </div>
      {relics.map((r, i) => !r.found && (
        <div key={i} className={`relic ${r.visible ? 'found' : 'hidden'}`} style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={KINDS[i]} alt="" />
        </div>
      ))}
      <canvas
        ref={soilRef}
        className="soil"
        onMouseMove={(e) => erase(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
        onTouchMove={(e) => { const rect = soilRef.current!.getBoundingClientRect(); const tch = e.touches[0]; erase(tch.clientX - rect.left, tch.clientY - rect.top); }}
        onClick={(e) => relics.forEach((r, i) => {
          if (r.found || !r.visible) return;
          if (Math.hypot(e.nativeEvent.offsetX - r.x * window.innerWidth, e.nativeEvent.offsetY - r.y * window.innerHeight) < 54) collect(i);
        })}
      />
      <div className="gate-hud">
        <div className="lbl">{t.recovered}</div>
        <div className="relics-row">{[0, 1, 2].map((i) => <i key={i} className={i < collected ? 'on' : ''} />)}</div>
        <div className="lbl" style={{ opacity: 0.6 }}>{collected} / 3</div>
      </div>
      {allFound && <div className="boot show">{t.booted}</div>}
    </div>
  );
}
