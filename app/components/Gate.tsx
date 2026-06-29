'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { translations, Language } from '../constants/translations';
import { RELIC_POOL } from '../constants/assets';
import type { DigSite } from '../constants/sites';

const COUNT = 3;        // relics to recover (keeps the 3-dot HUD)
const BRUSH = 50;       // brush radius in CSS px

type Relic = { x: number; y: number; src: string; found: boolean; visible: boolean };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; kind: 'dust' | 'sand' };

function shuffle<T>(arr: T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// fresh dig every session: a random subset of relics scattered at random, non-overlapping sites
function makeRelics(): Relic[] {
  const kinds = shuffle(RELIC_POOL).slice(0, COUNT);
  const pts: { x: number; y: number }[] = [];
  let guard = 0;
  while (pts.length < COUNT && guard++ < 600) {
    const x = 0.2 + Math.random() * 0.6;
    const y = 0.34 + Math.random() * 0.4;
    if (pts.every((p) => Math.hypot(p.x - x, p.y - y) > 0.22)) pts.push({ x, y });
  }
  while (pts.length < COUNT) pts.push({ x: 0.3 + pts.length * 0.2, y: 0.5 });
  return pts.map((p, i) => ({ ...p, src: kinds[i % kinds.length], found: false, visible: false }));
}

export function Gate({ onUnlock, lang, site }: { onUnlock: () => void; lang: Language; site: DigSite }) {
  const t = translations[lang];
  const soilRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const [relics, setRelics] = useState<Relic[]>(makeRelics);
  const [gone, setGone] = useState(false);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const collected = relics.filter((r) => r.found).length;
  const allFound = relics.length > 0 && collected === relics.length;

  // fx-layer state (kept off React so the render loop never re-mounts)
  const particles = useRef<Particle[]>([]);
  const brush = useRef<{ x: number; y: number; on: boolean }>({ x: 0, y: 0, on: false });

  // paint the data-quicksand: layered sand + drifting dust with buried site markings
  useEffect(() => {
    const canvas = soilRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const base = ctx.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0, '#100d09'); base.addColorStop(1, '#0a0806');
    ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
    // coarse sand clumps
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * W, y = Math.random() * H, s = Math.random() * 3 + 1;
      ctx.fillStyle = Math.random() > 0.5 ? '#241e15' : '#070605'; ctx.fillRect(x, y, s, s);
    }
    // fine top dust (lighter)
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = 'rgba(150,130,96,.06)';
      ctx.fillRect(Math.random() * W, Math.random() * H, 2, 1);
    }
    // sediment strata
    ctx.strokeStyle = 'rgba(60,48,30,.16)'; ctx.lineWidth = 1;
    for (let y = H * 0.18; y < H; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y + Math.sin(y) * 5); ctx.lineTo(W, y - 4); ctx.stroke();
    }
    ctx.fillStyle = '#1c1810'; ctx.font = '16px ui-monospace,monospace';
    ctx.fillText(`FIELD_${site.code}`, W * 0.12, H * 0.28);
    ctx.fillText(`${site.mark} // ${site.depth}`, W * 0.58, H * 0.78);
  }, [site.code, site.depth, site.mark]);

  // size the fx canvas to match the viewport
  useEffect(() => {
    const canvas = fxRef.current; if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
    canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
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

  // a brush stroke: feather the soil away (reads as sweeping dust) and kick up dust + sand
  const paint = useCallback((cx: number, cy: number) => {
    const canvas = soilRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    brush.current = { x: cx, y: cy, on: true };
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, BRUSH);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.55, 'rgba(0,0,0,.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, BRUSH, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (!reduce) {
      for (let i = 0; i < 2; i++) particles.current.push({
        x: cx + (Math.random() - 0.5) * BRUSH, y: cy + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 0.5, vy: -0.3 - Math.random() * 0.5,
        life: 0, max: 28 + Math.random() * 20, size: 5 + Math.random() * 7, kind: 'dust',
      });
      for (let i = 0; i < 4; i++) {
        const a = Math.random() * Math.PI * 2, sp = 0.6 + Math.random() * 1.8;
        particles.current.push({
          x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.4,
          life: 0, max: 16 + Math.random() * 14, size: 1 + Math.random() * 2, kind: 'sand',
        });
      }
      if (particles.current.length > 240) particles.current.splice(0, particles.current.length - 240);
    }
    checkReveal();
  }, [checkReveal, reduce]);

  // fx render loop — particles + brush ring on a layer that never blocks the soil's pointer events
  useEffect(() => {
    if (reduce) return;
    const canvas = fxRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const W = window.innerWidth, H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);
      const ps = particles.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life++; p.x += p.vx; p.y += p.vy;
        if (p.kind === 'sand') { p.vy += 0.14; p.vx *= 0.98; }
        else { p.vy -= 0.01; p.size += 0.18; }
        const k = 1 - p.life / p.max;
        if (k <= 0) { ps.splice(i, 1); continue; }
        if (p.kind === 'dust') {
          ctx.fillStyle = `rgba(180,160,120,${0.16 * k})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = `rgba(120,150,130,${0.7 * k})`;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      }
      const b = brush.current;
      if (b.on) {
        ctx.strokeStyle = 'rgba(95,224,122,.4)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(b.x, b.y, BRUSH * 0.7, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(95,224,122,.14)';
        ctx.beginPath(); ctx.arc(b.x, b.y, BRUSH, 0, Math.PI * 2); ctx.stroke();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

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
      <div className="gate-hint">{t.gate_hint} · {site.name} · {site.code}<b>{t.gate_hint2}</b></div>
      {/* keyboard-accessible excavation: hidden until focused, then operable by Enter/Space */}
      <div className="gate-kbd">
        {relics.map((r, i) => !r.found && (
          <button key={i} onClick={() => excavate(i)}>{t.kbd_relic} {i + 1} / {relics.length}</button>
        ))}
      </div>
      {relics.map((r, i) => (
        <button
          key={i}
          type="button"
          className={`relic ${r.visible ? 'exposed' : 'hidden'}${r.found ? ' collected' : ''}`}
          style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%` }}
          onClick={() => collect(i)}
          disabled={!r.visible || r.found}
          aria-label={`${r.found ? t.gate_done : r.visible ? t.gate_exposed : t.gate_buried} ${i + 1}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.src} alt="" />
          <span className="relic-state">{r.found ? t.gate_done : r.visible ? t.gate_exposed : t.gate_buried}</span>
        </button>
      ))}
      <canvas
        ref={soilRef}
        className="soil"
        onMouseMove={(e) => paint(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
        onMouseLeave={() => { brush.current.on = false; }}
        onTouchMove={(e) => { const rect = soilRef.current!.getBoundingClientRect(); const tch = e.touches[0]; paint(tch.clientX - rect.left, tch.clientY - rect.top); }}
        onTouchEnd={() => { brush.current.on = false; }}
        onClick={(e) => relics.forEach((r, i) => {
          if (r.found || !r.visible) return;
          if (Math.hypot(e.nativeEvent.offsetX - r.x * window.innerWidth, e.nativeEvent.offsetY - r.y * window.innerHeight) < 56) collect(i);
        })}
      />
      <canvas ref={fxRef} className="fx" aria-hidden="true" />
      <div className="gate-hud">
        <div className="lbl">{t.recovered}</div>
        <div className="relics-row">{relics.map((_, i) => <i key={i} className={i < collected ? 'on' : ''} />)}</div>
        <div className="lbl" style={{ opacity: 0.6 }}>{collected} / {relics.length}</div>
        <div className="gate-legend" aria-hidden="true">
          <span className="buried">{t.gate_buried}</span>
          <span className="exposed">{t.gate_exposed}</span>
          <span className="done">{t.gate_done}</span>
        </div>
      </div>
      {allFound && <div className="boot show">{t.booted}</div>}
    </div>
  );
}
