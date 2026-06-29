'use client';

import { useCallback, useRef, type CSSProperties } from 'react';
import { Era } from '../types';

const MIN = 640, MAX = 808;
const ZONES: { era: Era; from: number; to: number; color: string }[] = [
  { era: Era.GOLDEN_AGE, from: 640, to: 750, color: '58,208,192' },
  { era: Era.TURNING_POINT, from: 751, to: 760, color: '255,106,94' },
  { era: Era.WASTELAND, from: 761, to: 790, color: '217,138,55' },
  { era: Era.GHOST_SIGNAL, from: 791, to: 808, color: '53,232,154' },
];
const SCALE = [640, 680, 720, 760, 808];
const pct = (y: number) => ((y - MIN) / (MAX - MIN)) * 100;
const eraRGB = (era: Era) => ZONES.find((z) => z.era === era)?.color ?? '58,208,192';
const freqOf = (year: number) => ('00' + (year / 10).toFixed(2)).slice(-6);

type FindLog = { id: string; year: number; era: Era };

/** Strata band — the frequency dial drawn as an excavation section.
 *  Zone widths are proportional to each era's real duration (golden age is widest),
 *  the playhead is a pickaxe drilling through time, and recovered logs pin as find-tags. */
export function Tuner({
  year, onScrub, onCommit, logs = [], onPick, activeId, eraNames, depthText, label = 'STRATA BAND',
}: {
  year: number;
  onScrub: (y: number) => void;
  onCommit?: (y: number) => void;
  logs?: FindLog[];
  onPick?: (id: string) => void;
  activeId?: string | null;
  eraNames?: Record<Era, string>;
  depthText?: string;
  label?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const yearAt = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return year;
    const r = el.getBoundingClientRect();
    if (r.width <= 0) return year;
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
    <div className="strata">
      <div className="strata-head">
        <span>{label}</span>
        <span>{depthText ? `${depthText} · ` : ''}<b>{freqOf(year)}</b> MHz</span>
      </div>
      <div
        className="band"
        ref={trackRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="slider"
        aria-label="地层频带 · 年份 / strata band · year"
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={year}
        aria-valuetext={`${year} AD`}
        tabIndex={0}
        onKeyDown={(e) => {
          let y = year;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') y = Math.max(MIN, year - 1);
          else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') y = Math.min(MAX, year + 1);
          else if (e.key === 'PageDown') y = Math.max(MIN, year - 10);
          else if (e.key === 'PageUp') y = Math.min(MAX, year + 10);
          else if (e.key === 'Home') y = MIN;
          else if (e.key === 'End') y = MAX;
          else return;
          e.preventDefault(); onScrub(y); onCommit?.(y);
        }}
      >
        {ZONES.map((z) => (
          <div key={z.era} className="zone" style={{ flexGrow: z.to - z.from + 1, flexBasis: 0, ['--zc']: z.color } as CSSProperties}>
            <span className="zfill" />
            <span className="zlab">{eraNames?.[z.era] ?? ''}<b>{z.from}–{z.to}</b></span>
          </div>
        ))}

        {/* recovered-log markers — decorative (aria-hidden); keyboard/AT navigate via the archive chips.
            kept mouse-clickable as a convenience, and a stopPropagation so a click doesn't scrub the slider */}
        {logs.map((l) => (
          <span
            key={l.id}
            className={`find${activeId === l.id ? ' on' : ''}`}
            aria-hidden="true"
            style={{ left: `${pct(l.year)}%`, ['--ft']: `rgb(${eraRGB(l.era)})` } as CSSProperties}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onPick?.(l.id)}
          >
            <i /><b>{l.year}</b>
          </span>
        ))}

        <div className="play" style={{ left: `${pct(year)}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="pick" src="/sprites/ui_pickaxe.png" alt="" />
          <span className="line" />
          <span className="bub">{year} AD</span>
        </div>
      </div>
      <div className="axis" aria-hidden="true">
        {SCALE.map((y) => <span key={y}>{y}</span>)}
      </div>
    </div>
  );
}
