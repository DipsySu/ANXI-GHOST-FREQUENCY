'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { translations, Language } from '../constants/translations';
import { RELIC_POOL } from '../constants/assets';
import type { DigSite } from '../constants/sites';

const COUNT = 3;            // relics to recover (keeps the 3-dot HUD)
const MAXHP = 3;            // dig passes to break one soil tile
const REVEAL_FRAC = 0.55;   // fraction of a relic's covering tiles cleared before it surfaces
const RELIC_PX = 86;        // on-screen relic size (matches the .relic DOM sprite)
const DIRT = ['#2c2317', '#302719', '#2a2116', '#33291b', '#281f14']; // salt-crust soil palette
const DIG_CD = 38;          // ms cooldown per tile per stroke
const STEP_F = 0.45;        // pointer-stroke sample spacing, in tiles

type Relic = { x: number; y: number; src: string; found: boolean; visible: boolean };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; kind: 'chunk' | 'dust' | 'spark'; color: string };
type Flash = { x: number; y: number; life: number; max: number };
type GridState = { T: number; cols: number; rows: number; W: number; H: number; dpr: number };

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
    const x = 0.22 + Math.random() * 0.56;
    const y = 0.36 + Math.random() * 0.4;
    if (pts.every((p) => Math.hypot(p.x - x, p.y - y) > 0.22)) pts.push({ x, y });
  }
  while (pts.length < COUNT) pts.push({ x: 0.3 + pts.length * 0.2, y: 0.5 });
  return pts.map((p, i) => ({ ...p, src: kinds[i % kinds.length], found: false, visible: false }));
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const n2 = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function Gate({ onUnlock, lang, site }: { onUnlock: () => void; lang: Language; site: DigSite }) {
  const t = translations[lang];
  const rootRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLCanvasElement>(null);   // buried relics + soil base (revealed as tiles clear)
  const tilesRef = useRef<HTMLCanvasElement>(null);     // breakable soil tile grid (the dig surface)
  const fxRef = useRef<HTMLCanvasElement>(null);        // particles · tool · flashes
  const skipRef = useRef<HTMLButtonElement>(null);
  const [relics, setRelics] = useState<Relic[]>(makeRelics);
  const [gone, setGone] = useState(false);
  const [reduce, setReduce] = useState(false);
  const collected = relics.filter((r) => r.found).length;
  const allFound = relics.length > 0 && collected === relics.length;

  // --- mutable engine state (kept off React so the render loop never re-mounts) ---
  const grid = useRef<GridState>({ T: 40, cols: 0, rows: 0, W: 0, H: 0, dpr: 1 });
  const hp = useRef<Uint8Array>(new Uint8Array(0));
  const lastDug = useRef<Float64Array>(new Float64Array(0));
  const tilesDirty = useRef(true);
  const groundDirty = useRef(true);
  const particles = useRef<Particle[]>([]);
  const flashes = useRef<Flash[]>([]);
  const shake = useRef(0);
  const tool = useRef({ x: -1, y: -1, on: false, down: false, near: 0 });
  const coarse = useRef(false);      // touch pointer → wider brush
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const revealing = useRef<Set<number>>(new Set()); // dedupe reveal FX before React commits
  const relicImgs = useRef<Record<string, HTMLImageElement>>({});
  const relicsRef = useRef<Relic[]>(relics);
  const audio = useRef<AudioContext | null>(null);
  const lastTick = useRef(0);
  const lastThunk = useRef(0);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { relicsRef.current = relics; groundDirty.current = true; }, [relics]);

  // read reduced-motion in an effect (not during render) so SSR/first paint stay deterministic; track changes
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(m.matches);
    const h = () => setReduce(m.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);

  // --- tiny WebAudio juice (no assets); started on first dig gesture, off under reduced-motion ---
  const blip = useCallback((freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number) => {
    const ac = audio.current;
    if (reduce || !ac) return;
    const t0 = ac.currentTime;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t0); osc.stop(t0 + dur);
  }, [reduce]);
  const playTick = useCallback(() => { const n = performance.now(); if (n - lastTick.current < 32) return; lastTick.current = n; blip(420 + Math.random() * 120, 0.025, 'square', 0.022); }, [blip]);
  const playThunk = useCallback(() => { const n = performance.now(); if (n - lastThunk.current < 40) return; lastThunk.current = n; blip(110 + Math.random() * 40, 0.08, 'square', 0.06, 70); }, [blip]);
  const playDing = useCallback(() => { blip(740, 0.12, 'triangle', 0.09, 1180); window.setTimeout(() => blip(1180, 0.1, 'triangle', 0.06), 70); }, [blip]);

  // --- layout: size canvases to the viewport; remap dig progress across a resize (don't wipe it) ---
  const layout = useCallback(() => {
    const W = window.innerWidth, H = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const T = Math.max(30, Math.round(Math.min(W, H) / 22));
    const cols = Math.ceil(W / T), rows = Math.ceil(H / T);
    const prev = grid.current, prevHp = hp.current;
    const next = new Uint8Array(cols * rows);
    if (prevHp.length && prev.cols && prev.rows) {
      // remap by normalized cell center so a resize keeps the hole you already dug
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const nx = (c + 0.5) * T / W, ny = (r + 0.5) * T / H;
        const oc = clamp(Math.floor(nx * prev.W / prev.T), 0, prev.cols - 1);
        const or = clamp(Math.floor(ny * prev.H / prev.T), 0, prev.rows - 1);
        next[r * cols + c] = prevHp[or * prev.cols + oc];
      }
    } else {
      next.fill(MAXHP);
    }
    grid.current = { T, cols, rows, W, H, dpr };
    hp.current = next;
    lastDug.current = new Float64Array(cols * rows);
    for (const cv of [groundRef.current, tilesRef.current, fxRef.current]) {
      if (!cv) continue;
      cv.width = W * dpr; cv.height = H * dpr;
      const ctx = cv.getContext('2d');
      if (ctx) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = false; }
    }
    tilesDirty.current = true; groundDirty.current = true;
  }, []);

  // --- ground: soil base + buried relics drawn dim (the tile layer on top hides them until dug) ---
  const drawGround = useCallback(() => {
    const cv = groundRef.current; const ctx = cv?.getContext('2d'); if (!cv || !ctx) return;
    const { W, H } = grid.current;
    ctx.clearRect(0, 0, W, H);
    const base = ctx.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0, '#0e0b07'); base.addColorStop(1, '#070504');
    ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
    // Uneven sediment stains: broad enough to imply strata, too broken to read as wallpaper.
    for (let i = 0; i < 5; i++) {
      const y = H * (0.1 + i * 0.18) + Math.sin(i * 1.9) * 24;
      const bandH = 18 + n2(i, 15) * 34;
      const g = ctx.createLinearGradient(0, y, 0, y + bandH);
      g.addColorStop(0, i % 2 ? 'rgba(96,76,45,0)' : 'rgba(17,11,7,0)');
      g.addColorStop(0.45, i % 2 ? 'rgba(96,76,45,.09)' : 'rgba(17,11,7,.22)');
      g.addColorStop(1, i % 2 ? 'rgba(96,76,45,0)' : 'rgba(17,11,7,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, y, W, bandH);
    }
    // Clustered salt flecks and broken contour scars in the uncovered dark layer.
    for (let i = 0; i < 34; i++) {
      const cx = n2(i, 2) * W, cy = n2(i, 5) * H;
      const flecks = 2 + Math.floor(n2(i, 8) * 5);
      ctx.fillStyle = n2(i, 13) > 0.5 ? 'rgba(197,178,125,.12)' : 'rgba(88,69,42,.18)';
      for (let j = 0; j < flecks; j++) {
        const x = cx + (n2(i * 17 + j, 3) - 0.5) * 42;
        const y = cy + (n2(i * 13, j + 9) - 0.5) * 24;
        const s = n2(i + j, 18) > 0.78 ? 2 : 1;
        ctx.fillRect(x, y, s, 1);
      }
    }
    ctx.strokeStyle = 'rgba(117,92,54,.13)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      const y = H * n2(i, 11);
      for (let s = 0; s < 5; s++) {
        if (n2(i + 31, s + 17) < 0.42) continue;
        const x0 = n2(i * 7 + s, 21) * W;
        const len = 64 + n2(i + 43, s + 5) * 150;
        ctx.beginPath();
        for (let k = 0; k < 5; k++) {
          const x = x0 + (len * k) / 4;
          const yy = y + Math.sin((x + i * 47) * 0.018) * 5 + (n2(i + k, s) - 0.5) * 10;
          if (k === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#171208'; ctx.font = '15px ui-monospace, monospace';
    ctx.fillText(`FIELD_${site.code}`, W * 0.1, H * 0.22);
    ctx.fillText(`${site.mark} // ${site.depth}`, W * 0.6, H * 0.8);
    for (const r of relicsRef.current) {
      const img = relicImgs.current[r.src];
      if (!img || !img.complete || img.naturalWidth === 0) continue;
      const cx = r.x * W, cy = r.y * H;
      if (!r.visible && !r.found) {
        const sx = Math.floor(r.x * 997);
        const sy = Math.floor(r.y * 991);
        ctx.save();
        ctx.globalAlpha = 0.55;
        for (let i = 0; i < 7; i++) {
          const ox = (n2(sx + i * 11, sy + 3) - 0.5) * 74;
          const oy = (n2(sx + 5, sy + i * 13) - 0.5) * 48;
          const w = 10 + n2(sx + i * 7, sy + 19) * 24;
          const h = 1 + Math.floor(n2(sx + 23, sy + i * 5) * 3);
          ctx.fillStyle = i % 2 ? 'rgba(104,82,48,.08)' : 'rgba(8,6,4,.16)';
          ctx.fillRect(cx + ox - w / 2, cy + oy, w, h);
        }
        ctx.restore();
        continue;
      }
      ctx.save();
      if (r.found) { ctx.filter = 'sepia(1) saturate(2) brightness(.9)'; ctx.globalAlpha = 0.85; }
      else if (r.visible) { ctx.filter = 'none'; ctx.globalAlpha = 1; }
      ctx.drawImage(img, cx - RELIC_PX / 2, cy - RELIC_PX / 2, RELIC_PX, RELIC_PX);
      ctx.restore();
    }
  }, [site.code, site.mark, site.depth]);

  // --- tiles: salt-crust cover with faint scanner units, cracks, and collapsed hole rims ---
  const drawTiles = useCallback(() => {
    const cv = tilesRef.current; const ctx = cv?.getContext('2d'); if (!cv || !ctx) return;
    const { T, cols, rows, W, H } = grid.current;
    ctx.clearRect(0, 0, W, H);
    const h = hp.current;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = h[r * cols + c];
        if (v <= 0) continue;
        const x = c * T, y = r * T;
        const depth = y / Math.max(1, H);
        const grain = n2(c + 11, r + 19);
        ctx.globalAlpha = 0.92;
        const red = Math.round(36 + depth * 6 + grain * 3);
        const green = Math.round(29 + depth * 5 + n2(c + 23, r + 2) * 3);
        const blue = Math.round(18 + depth * 3 + n2(c + 3, r + 31) * 2);
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(x, y, T, T);
        ctx.globalAlpha = 1;
        const wash = n2(c + 71, r + 29);
        if (wash > 0.88) {
          ctx.fillStyle = wash > 0.96 ? 'rgba(87,67,39,.2)' : 'rgba(186,151,86,.1)';
          const wy = y + 5 + Math.floor(n2(c + 17, r + 41) * Math.max(4, T - 14));
          const wx = x + 4 + Math.floor(n2(c + 9, r + 33) * Math.max(2, T - 18));
          ctx.fillRect(wx, wy, 5 + Math.floor(n2(c + 44, r + 6) * 12), 1);
        }
        // mottled salt crust, not a tile bevel.
        const specks = 2 + Math.floor(n2(c + 19, r + 23) * 3);
        for (let i = 0; i < specks; i++) {
          const px = x + 4 + Math.floor(n2(c * 9 + i, r * 7) * Math.max(4, T - 8));
          const py = y + 4 + Math.floor(n2(c * 5, r * 11 + i) * Math.max(4, T - 8));
          ctx.fillStyle = i % 2 ? 'rgba(0,0,0,.18)' : 'rgba(169,139,84,.12)';
          ctx.fillRect(px, py, 2, 1 + (i & 1));
        }
        // The scanner grid is barely there; the excavation edges carry the square grammar.
        ctx.fillStyle = 'rgba(204,174,111,.025)';
        if (r % 6 === 0) ctx.fillRect(x, y, T, 1);
        if (c % 9 === 0 && r % 2 === 0) ctx.fillRect(x, y, 1, T);
        // Sparse crust seams: occasional short fractures, not repeated tile cracks.
        if (n2(c + 3, r + 5) > 0.86) {
          ctx.strokeStyle = 'rgba(0,0,0,.34)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          const sx = x + T * (0.2 + n2(c, r + 31) * 0.56);
          const sy = y + T * (0.16 + n2(c + 11, r) * 0.56);
          const horizontal = n2(c + 29, r + 2) > 0.52;
          ctx.moveTo(sx, sy);
          if (horizontal) {
            ctx.lineTo(sx + T * (0.18 + n2(c + 7, r) * 0.24), sy + (n2(c + 8, r + 4) - 0.5) * T * 0.18);
            if (n2(c + 18, r + 2) > 0.55) ctx.lineTo(sx + T * 0.08, sy + T * 0.22);
          } else {
            ctx.lineTo(sx + (n2(c + 7, r) - 0.5) * T * 0.18, sy + T * (0.18 + n2(c + 9, r) * 0.22));
            if (n2(c + 18, r + 2) > 0.55) ctx.lineTo(sx - T * 0.14, sy + T * 0.12);
          }
          ctx.stroke();
        }
        // recessed depth: only holes get strong edges, so digging creates the excavation grammar.
        const edgeShadow = 'rgba(0,0,0,.68)';
        const edgeSalt = 'rgba(183,149,86,.24)';
        if (c > 0 && h[r * cols + c - 1] <= 0) { ctx.fillStyle = edgeShadow; ctx.fillRect(x, y, 6, T); ctx.fillStyle = edgeSalt; ctx.fillRect(x + 6, y + 3, 2, T - 6); }
        if (c < cols - 1 && h[r * cols + c + 1] <= 0) { ctx.fillStyle = edgeShadow; ctx.fillRect(x + T - 6, y, 6, T); ctx.fillStyle = edgeSalt; ctx.fillRect(x + T - 8, y + 3, 2, T - 6); }
        if (r > 0 && h[(r - 1) * cols + c] <= 0) { ctx.fillStyle = edgeShadow; ctx.fillRect(x, y, T, 6); ctx.fillStyle = edgeSalt; ctx.fillRect(x + 3, y + 6, T - 6, 2); }
        if (r < rows - 1 && h[(r + 1) * cols + c] <= 0) { ctx.fillStyle = edgeShadow; ctx.fillRect(x, y + T - 6, T, 6); ctx.fillStyle = edgeSalt; ctx.fillRect(x + 3, y + T - 8, T - 6, 2); }
        if (v < MAXHP) {
          ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x + T * 0.3, y + 3); ctx.lineTo(x + T * 0.5, y + T * 0.55); ctx.lineTo(x + T * 0.38, y + T - 3); ctx.stroke();
          ctx.fillStyle = 'rgba(205,177,119,.12)';
          ctx.fillRect(x + 3, y + T - 5, T - 7, 2);
        }
        if (v === 1) {
          ctx.fillStyle = 'rgba(12,8,5,.22)'; ctx.fillRect(x + 2, y + 2, T - 4, T - 4);
          ctx.strokeStyle = 'rgba(0,0,0,.55)';
          ctx.beginPath(); ctx.moveTo(x + T * 0.66, y + 4); ctx.lineTo(x + T * 0.52, y + T * 0.5); ctx.lineTo(x + T * 0.7, y + T - 4); ctx.stroke();
          ctx.clearRect(x, y, 3 + Math.floor(n2(c, r) * 4), 3);
          ctx.clearRect(x + T - 5, y + T - 5, 5, 5);
          if (n2(c + 40, r) > 0.5) ctx.clearRect(x + T - 4, y, 4, 4);
        }
      }
    }
    // Broken surface seams across the still-covered surface.
    ctx.strokeStyle = 'rgba(143,111,62,.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const y = H * (0.1 + i * 0.14) + Math.sin(i) * 18;
      for (let s = 0; s < 8; s++) {
        if (n2(i + 6, s + 40) < 0.5) continue;
        const x0 = n2(i * 19 + s, 4) * W;
        const len = 38 + n2(i + 18, s + 2) * 118;
        ctx.beginPath();
        for (let k = 0; k < 4; k++) {
          const x = x0 + (len * k) / 3;
          const yy = y + Math.sin(x * 0.015 + i * 1.9) * 4 + (n2(i + k, s + 20) - 0.5) * 8;
          if (k === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
    }
  }, []);

  const burst = useCallback((x: number, y: number) => {
    if (reduce) return;
    const ps = particles.current;
    const col = DIRT[(Math.random() * DIRT.length) | 0];
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2, sp = 0.9 + Math.random() * 2.6;
      ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.1, life: 0, max: 16 + Math.random() * 16, size: 2 + Math.random() * 3, kind: 'chunk', color: col });
    }
    if (ps.length > 340) ps.splice(0, ps.length - 340);
  }, [reduce]);

  // pixel-chunk dust kicked up by the tool while digging
  const toolDust = useCallback((x: number, y: number) => {
    if (reduce) return;
    for (let i = 0; i < 2; i++) particles.current.push({ x: x + (Math.random() - 0.5) * 26, y: y + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 0.6, vy: -0.4 - Math.random() * 0.6, life: 0, max: 22 + Math.random() * 14, size: 2 + Math.random() * 2, kind: 'dust', color: '198,176,132' });
  }, [reduce]);

  const revealFx = useCallback((cx: number, cy: number) => {
    playDing();
    if (reduce) return;
    flashes.current.push({ x: cx, y: cy, life: 0, max: 18 });
    shake.current = 9;
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2, sp = 1.2 + Math.random() * 3.2;
      particles.current.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 18 + Math.random() * 18, size: 2 + Math.random() * 2, kind: 'spark', color: '231,178,77' });
    }
  }, [reduce, playDing]);

  // collect: a tight "lock-in" stamp — deliberately smaller than the reveal so the two read differently
  const collectFx = useCallback((cx: number, cy: number) => {
    blip(520, 0.05, 'square', 0.05, 760);
    if (reduce) return;
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2, sp = 0.8 + Math.random() * 2;
      particles.current.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6, life: 0, max: 14 + Math.random() * 12, size: 2, kind: 'spark', color: '231,178,77' });
    }
  }, [blip, reduce]);

  const clearedFrac = useCallback((r: Relic) => {
    const { T, cols, rows, W, H } = grid.current;
    const cx = r.x * W, cy = r.y * H, half = RELIC_PX / 2;
    const c0 = clamp(Math.floor((cx - half) / T), 0, cols - 1), c1 = clamp(Math.floor((cx + half) / T), 0, cols - 1);
    const r0 = clamp(Math.floor((cy - half) / T), 0, rows - 1), r1 = clamp(Math.floor((cy + half) / T), 0, rows - 1);
    let total = 0, clear = 0;
    for (let rr = r0; rr <= r1; rr++) for (let cc = c0; cc <= c1; cc++) { total++; if (hp.current[rr * cols + cc] <= 0) clear++; }
    return total ? clear / total : 0;
  }, []);

  // dedupe with revealing-set so a relic only fires its reveal FX once, regardless of React timing
  const checkReveals = useCallback(() => {
    const { W, H } = grid.current;
    const newly: number[] = [];
    relicsRef.current.forEach((r, i) => {
      if (r.found || r.visible || revealing.current.has(i)) return;
      if (clearedFrac(r) >= REVEAL_FRAC) { revealing.current.add(i); newly.push(i); }
    });
    if (newly.length === 0) return;
    setRelics((prev) => prev.map((r, i) => (newly.includes(i) ? { ...r, visible: true } : r)));
    newly.forEach((i) => { const r = relicsRef.current[i]; revealFx(r.x * W, r.y * H); });
  }, [clearedFrac, revealFx]);

  // a dig stroke at (cx,cy): center-weighted HP knockoff (2 inner / 1 outer), throttled per tile
  const dig = useCallback((cx: number, cy: number) => {
    const { T, cols, rows } = grid.current;
    if (!cols || !rows || hp.current.length !== cols * rows) return; // grid not laid out yet
    const rad = T * (coarse.current ? 1.55 : 1.3);
    const inner = rad * 0.65;
    const now = performance.now();
    const c0 = clamp(Math.floor((cx - rad) / T), 0, cols - 1), c1 = clamp(Math.floor((cx + rad) / T), 0, cols - 1);
    const r0 = clamp(Math.floor((cy - rad) / T), 0, rows - 1), r1 = clamp(Math.floor((cy + rad) / T), 0, rows - 1);
    let changed = false, broke = false, chipped = false;
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const idx = r * cols + c;
        const before = hp.current[idx];
        if (before <= 0) continue;
        const tx = c * T + T / 2, ty = r * T + T / 2;
        const d = Math.hypot(tx - cx, ty - cy);
        if (d > rad) continue;
        if (now - lastDug.current[idx] < DIG_CD) continue;
        lastDug.current[idx] = now;
        hp.current[idx] = Math.max(0, before - (d <= inner ? 2 : 1));
        changed = true;
        if (hp.current[idx] === 0) { burst(tx, ty); broke = true; } else chipped = true;
      }
    }
    if (changed) { tilesDirty.current = true; toolDust(cx, cy); checkReveals(); }
    if (broke) playThunk(); else if (chipped) playTick();
  }, [burst, toolDust, checkReveals, playThunk, playTick]);

  // load relic sprites for the canvas (DOM <img> still drives click/keyboard + the reveal pop)
  useEffect(() => {
    let live = true;
    relics.forEach((r) => {
      if (relicImgs.current[r.src]) return;
      const img = new Image();
      img.onload = () => { if (live) groundDirty.current = true; };
      img.src = r.src;
      relicImgs.current[r.src] = img;
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // size + initial paint; remap (not wipe) on resize, debounced
  useEffect(() => {
    layout();
    let raf = 0;
    const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(raf); };
  }, [layout]);

  // the one render loop: repaint dirty layers + animate fx
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (tilesDirty.current) { drawTiles(); tilesDirty.current = false; }
      if (groundDirty.current) { drawGround(); groundDirty.current = false; }
      const cv = fxRef.current; const ctx = cv?.getContext('2d'); if (!cv || !ctx) return;
      const { W, H } = grid.current;

      // screen shake (reveal only) — applied to the whole gate, decays fast
      if (rootRef.current) {
        if (shake.current > 0.4) {
          shake.current *= 0.82;
          rootRef.current.style.transform = `translate(${(Math.random() - 0.5) * shake.current}px,${(Math.random() - 0.5) * shake.current}px)`;
        } else if (rootRef.current.style.transform) {
          shake.current = 0; rootRef.current.style.transform = '';
        }
      }

      ctx.clearRect(0, 0, W, H);

      const ps = particles.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life++; p.x += p.vx; p.y += p.vy;
        if (p.kind === 'chunk') { p.vy += 0.24; p.vx *= 0.99; }
        else if (p.kind === 'spark') { p.vy += 0.05; p.vx *= 0.96; p.vy *= 0.96; }
        else { p.vy -= 0.02; }
        const k = 1 - p.life / p.max;
        if (k <= 0) { ps.splice(i, 1); continue; }
        if (p.kind === 'dust') { ctx.fillStyle = `rgba(${p.color},${0.5 * k})`; ctx.fillRect(p.x, p.y, p.size, p.size); }
        else if (p.kind === 'spark') { ctx.fillStyle = `rgba(${p.color},${k})`; ctx.fillRect(p.x, p.y, p.size, p.size); }
        else { ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, k); ctx.fillRect(p.x, p.y, p.size, p.size); ctx.globalAlpha = 1; }
      }

      const fs = flashes.current;
      for (let i = fs.length - 1; i >= 0; i--) {
        const f = fs[i]; f.life++;
        const k = 1 - f.life / f.max;
        if (k <= 0) { fs.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(231,178,77,${k})`; ctx.lineWidth = 2;
        const rad = (1 - k) * 70 + 10;
        ctx.strokeRect(f.x - rad, f.y - rad, rad * 2, rad * 2);
        ctx.fillStyle = `rgba(255,247,230,${k * 0.5})`;
        ctx.fillRect(f.x - RELIC_PX / 2, f.y - RELIC_PX / 2, RELIC_PX, RELIC_PX);
      }

      // tool: a pixel "detector" ring — turns gold + tightens as it nears a buried relic
      const tl = tool.current;
      if (tl.on && tl.x >= 0) {
        const T2 = grid.current.T;
        const hintNear = clamp(T2 * 3.5, 90, 170);
        let near = 0;
        for (const r of relicsRef.current) {
          if (r.found || r.visible) continue;
          near = Math.max(near, Math.max(0, 1 - Math.hypot(r.x * W - tl.x, r.y * H - tl.y) / hintNear));
        }
        tl.near = near;
        const pulse = reduce ? 0.7 : 0.5 + 0.5 * Math.sin(performance.now() / (near > 0 ? 90 : 240));
        const col = `rgba(${Math.round(95 + 136 * near)},${Math.round(224 - 46 * near)},${Math.round(122 - 45 * near)},`;
        ctx.strokeStyle = col + (0.5 + 0.4 * pulse * (0.5 + near)) + ')'; ctx.lineWidth = 2;
        const rr = T2 * 1.35;
        ctx.strokeRect(tl.x - rr, tl.y - rr, rr * 2, rr * 2);
        ctx.strokeStyle = col + '0.85)';
        ctx.beginPath(); ctx.moveTo(tl.x - 7, tl.y); ctx.lineTo(tl.x + 7, tl.y); ctx.moveTo(tl.x, tl.y - 7); ctx.lineTo(tl.x, tl.y + 7); ctx.stroke();
        // "hot" cue: corner ticks that grow as you near a relic (without pinpointing it)
        if (near > 0.35) {
          const tk = 4 + near * 7, o = rr + 3;
          ctx.lineWidth = 2;
          for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
            ctx.beginPath();
            ctx.moveTo(tl.x + sx * o, tl.y + sy * o - sy * tk); ctx.lineTo(tl.x + sx * o, tl.y + sy * o); ctx.lineTo(tl.x + sx * o - sx * tk, tl.y + sy * o);
            ctx.stroke();
          }
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [drawTiles, drawGround, reduce]);

  // --- pointer handling: dig only while pressed, with stroke interpolation so fast drags don't skip ---
  const ensureAudio = useCallback(() => {
    if (reduce || audio.current) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audio.current = new AC();
    } catch { /* no audio — fine */ }
  }, [reduce]);

  const localXY = (e: React.PointerEvent) => {
    const rect = tilesRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onDown = useCallback((e: React.PointerEvent) => {
    ensureAudio();
    coarse.current = e.pointerType === 'touch';
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const { x, y } = localXY(e);
    tool.current.x = x; tool.current.y = y; tool.current.on = true; tool.current.down = true;
    lastPt.current = { x, y };
    dig(x, y);
  }, [dig, ensureAudio]);
  const onMove = useCallback((e: React.PointerEvent) => {
    const { x, y } = localXY(e);
    tool.current.x = x; tool.current.y = y; tool.current.on = true;
    if (!tool.current.down) return;
    const last = lastPt.current;
    if (last) {
      const dx = x - last.x, dy = y - last.y, dist = Math.hypot(dx, dy);
      const step = grid.current.T * STEP_F;
      const n = clamp(Math.ceil(dist / step), 1, 24);
      for (let i = 1; i <= n; i++) dig(last.x + dx * (i / n), last.y + dy * (i / n));
    } else dig(x, y);
    lastPt.current = { x, y };
  }, [dig]);
  const onUp = useCallback(() => { tool.current.down = false; lastPt.current = null; if (coarse.current) tool.current.on = false; }, []);
  const onLeave = useCallback(() => { tool.current.on = false; tool.current.down = false; lastPt.current = null; }, []);

  const collect = useCallback((i: number) => {
    const r = relicsRef.current[i];
    if (!r || r.found || !r.visible) return;
    const cv = grid.current;
    setRelics((prev) => prev.map((x, j) => (j === i ? { ...x, found: true } : x)));
    collectFx(r.x * cv.W, r.y * cv.H); // distinct from reveal; fired outside the updater
  }, [collectFx]);

  // keyboard / assistive path: excavate (reveal + collect) a relic without the pointer scrape
  const excavate = useCallback((i: number) => {
    const r = relicsRef.current[i];
    if (!r || r.found) return;
    revealing.current.add(i);
    setRelics((prev) => prev.map((x, j) => (j === i ? { ...x, visible: true, found: true } : x)));
    const cv = grid.current;
    collectFx(r.x * cv.W, r.y * cv.H);
  }, [collectFx]);

  useEffect(() => { skipRef.current?.focus(); }, []);

  // close the audio context on unmount
  useEffect(() => () => { audio.current?.close(); audio.current = null; if (unlockTimer.current) clearTimeout(unlockTimer.current); }, []);

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
    <div ref={rootRef} className={`gate${gone ? ' gone' : ''}`}>
      <button ref={skipRef} className="gate-skip" onClick={() => { if (gone) return; setGone(true); unlockTimer.current = setTimeout(onUnlock, reduce ? 50 : 300); }}>{t.skip}</button>
      <div className="gate-hint">{t.gate_hint} · {site.name} · {site.code}<b>{t.gate_hint2}</b></div>

      <canvas ref={groundRef} className="gate-ground" aria-hidden="true" />

      {relics.map((r, i) => (
        <button
          key={i}
          type="button"
          className={`relic ${r.visible ? 'exposed' : 'hidden'}${r.found ? ' collected' : ''}`}
          style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%` }}
          onClick={() => collect(i)}
          disabled={!r.visible || r.found}
          aria-hidden={r.visible ? undefined : true}
          aria-label={`${r.found ? t.gate_done : r.visible ? t.gate_exposed : t.gate_buried} ${i + 1}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.src} alt="" />
        </button>
      ))}

      <canvas
        ref={tilesRef}
        className="gate-tiles"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onLeave}
        onPointerLeave={onLeave}
      />
      <canvas ref={fxRef} className="fx" aria-hidden="true" />

      {/* assistive / keyboard excavation — secondary control, not the primary way to play */}
      {!allFound && (
        <div className="gate-kbd" role="group" aria-label={t.kbd_relic}>
          <span className="klbl">{t.kbd_assist}</span>
          {relics.map((r, i) => !r.found && (
            <button key={i} onClick={() => excavate(i)} aria-label={`${t.kbd_relic} ${i + 1} / ${relics.length}`}>{i + 1}</button>
          ))}
        </div>
      )}

      <div className="gate-hud">
        <div className="lbl">{t.recovered}</div>
        <div className="relics-row" aria-hidden="true">
          {relics.map((r, i) => (
            <i
              key={i}
              className={r.found ? 'done' : r.visible ? 'exposed' : 'buried'}
            />
          ))}
        </div>
        <div className="lbl" style={{ opacity: 0.6 }}>{collected} / {relics.length}</div>
      </div>
      {allFound && <div className="boot show">{t.booted}</div>}
    </div>
  );
}
