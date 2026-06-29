import { Era } from '../types';

/** PixelLab-generated portraits, matched by sender name keyword. */
const PORTRAITS: { match: string[]; file: string }[] = [
  { match: ['沙狼', '归尘', 'Sand Wolf'], file: '/sprites/port_shalang.png' },
  { match: ['郭昕', 'Guo Xin'], file: '/sprites/port_guoxin.png' },
  { match: ['老赵', 'Zhao'], file: '/sprites/port_laozhao.png' },
  { match: ['高仙芝', 'Gao'], file: '/sprites/port_gaoxianzhi.png' },
  { match: ['小胡', 'Xiaohu'], file: '/sprites/port_xiaohu.png' },
];

export function portraitFor(sender: string): string | null {
  const m = PORTRAITS.find((p) => p.match.some((k) => sender.includes(k)));
  return m ? m.file : null;
}

/** Pre-generated 8-bit era scenes; one is chosen deterministically per log. */
const SCENES: Record<Era, string[]> = {
  [Era.GOLDEN_AGE]: ['/scenes/scene_golden_kucha.png', '/scenes/scene_golden_market.png'],
  [Era.TURNING_POINT]: ['/scenes/scene_turning_alert.png'],
  [Era.WASTELAND]: ['/scenes/scene_wasteland_hexi.png', '/scenes/scene_wasteland_bunker.png'],
  [Era.GHOST_SIGNAL]: ['/scenes/scene_ghost_kucha.png', '/scenes/scene_ghost_suiye.png'],
};

export function sceneFor(era: Era, seed: string): string {
  const arr = SCENES[era] ?? SCENES[Era.WASTELAND];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

export const RELICS = {
  coin: '/sprites/relic_coin.png',
  chip: '/sprites/relic_chip.png',
  jade: '/sprites/relic_jade.png',
};

/**
 * Expandable relic pool for the excavation gate. Each session the gate draws a random
 * subset (and scatters them at random sites), so no two digs feel the same.
 * To add variety: generate a new pixel sprite (PixelLab, or any 8-bit art) into
 * /public/sprites and append its path here — it joins the rotation automatically.
 */
export const RELIC_POOL: string[] = [
  RELICS.coin,
  RELICS.chip,
  RELICS.jade,
  '/sprites/relic_crystal.png',
  '/sprites/relic_gear.png',
  '/sprites/relic_flask.png',
  '/sprites/relic_blade.png',
  '/sprites/relic_cable.png',
  '/sprites/relic_debris.png',
  '/sprites/relic_scroll.png',
  '/sprites/relic_seal_broken.png',
  '/sprites/relic_tower_core.png',
  '/sprites/relic_silk_map.png',
  '/sprites/relic_key.png',
  '/sprites/relic_battery.png',
  '/sprites/relic_lens.png',
  '/sprites/relic_bell.png',
];

export const SEAL = '/sprites/ui_seal.png';
