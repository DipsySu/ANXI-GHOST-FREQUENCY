'use client';

import { useCallback, useRef } from 'react';
import { Era } from '../types';

const MIN = 640, MAX = 808;
const ZONES: { era: Era; from: number; to: number; color: string }[] = [
  { era: Era.GOLDEN_AGE, from: 640, to: 750, color: '58,208,192' },
  { era: Era.TURNING_POINT, from: 751, to: 760, color: '255,106,94' },
  { era: Era.WASTELAND, from: 761, to: 790, color: '217,138,55' },
  { era: Era.GHOST_SIGNAL, from: 791, to: 808, color: '53,232,154' },
];
const SCALE = [640, 680, 720, 760, 800, 808];
const TICKS = Array.from({ length: (MAX - MIN) / 10 + 1 }, (_, i) => MIN + i * 10);
const pct = (y: number) => ((y - MIN) / (MAX - MIN)) * 100;

export function Tuner({ year, onScrub, onCommit }: { year: number; onScrub: (y: number) => void; onCommit?: (y: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const yearAt = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return year;
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return Math.round(MIN + p * (MAX - MIN));
  };

  const down = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    onScrub(yearAt(e.clientX));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScrub]);
  const move = useCallback((e: React.PointerEvent) => {
    if (dragging.current) onScrub(yearAt(e.clientX));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScrub]);
  const up = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    onCommit?.(yearAt(e.clientX));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCommit]);

  return (
    <div className="tuner">
      <div
        className="track"
        ref={trackRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="slider"
        aria-label="频率调谐 · 年份"
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={year}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') { e.preventDefault(); const y = Math.max(MIN, year - 1); onScrub(y); onCommit?.(y); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); const y = Math.min(MAX, year + 1); onScrub(y); onCommit?.(y); }
        }}
      >
        <div className="zones">
          {ZONES.map((z) => (
            <div
              key={z.era}
              className="zone"
              style={{
                flexBasis: `${((z.to - z.from + 1) / (MAX - MIN + 1)) * 100}%`,
                background: `linear-gradient(180deg, rgba(${z.color},.04), rgba(${z.color},.18))`,
              }}
            />
          ))}
        </div>
        <div className="ticks">
          {TICKS.map((y) => (
            <i key={y} className={`tk${y % 40 === 0 ? ' major' : ''}`} style={{ left: `${pct(y)}%` }} />
          ))}
        </div>
        <div className="head" style={{ left: `${pct(year)}%` }}>
          <span className="knob" />
          <span className="yrbubble">{year}</span>
        </div>
      </div>
      <div className="scale" aria-hidden="true">
        {SCALE.map((y) => <span key={y}>{y}</span>)}
      </div>
    </div>
  );
}
