'use client';

import { useEffect, useRef } from 'react';

/** Pixel-static / phosphor field that lives behind the screen. Density scales with `intensity`
 *  (driven by era memory decay): the more degraded the era, the louder the static. */
export function AmbientField({ accent, intensity = 0.4 }: { accent: [number, number, number]; intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const intRef = useRef(intensity);
  const accRef = useRef(accent);

  // keep the latest props available to the long-lived render loop without restarting it
  useEffect(() => { intRef.current = intensity; accRef.current = accent; });

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cell = 5;
    let w = 0, h = 0, raf = 0, last = 0, beam = -0.2;

    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = cv.width = Math.max(1, Math.floor(r.width));
      h = cv.height = Math.max(1, Math.floor(r.height));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const render = () => {
      const [r, g, b] = accRef.current;
      const it = intRef.current;
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
      const n = Math.floor(cols * rows * (0.03 + it * 0.12));
      for (let i = 0; i < n; i++) {
        const x = ((Math.random() * cols) | 0) * cell;
        const y = ((Math.random() * rows) | 0) * cell;
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.random() * 0.4 * (0.4 + it)})`;
        ctx.fillRect(x, y, cell, cell);
      }
      // slow scanning beam
      beam += 0.0016 + it * 0.001;
      if (beam > 1.2) beam = -0.2;
      const by = beam * h;
      const grd = ctx.createLinearGradient(0, by - 40, 0, by + 40);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(0.5, `rgba(${r},${g},${b},${0.05 + it * 0.05})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, by - 40, w, 80);
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 80) return; // ~12fps static
      last = t;
      render();
    };
    if (reduce) {
      render();
    } else {
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="field" aria-hidden="true" />;
}
