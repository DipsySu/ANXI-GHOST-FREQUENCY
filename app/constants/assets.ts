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

/**
 * Pre-generated era scenes — all runtime scene art is kept in the same pixel-art language.
 * sceneFor() picks one deterministically per log. The imagegen-derived scene set lives under
 * /public/generated/anxi-pixel as web-light 512x288 PNG assets.
 */
const PIXEL = '/generated/anxi-pixel';
const SCENES: Record<Era, string[]> = {
  [Era.GOLDEN_AGE]: [
    '/scenes/scene_golden_kucha.png', '/scenes/scene_golden_market.png',
    `${PIXEL}/01-golden-kucha-market.png`, `${PIXEL}/07-khotan-jade-shrine.png`,
    `${PIXEL}/08-frontier-green-beacon.png`, `${PIXEL}/09-kucha-glitch-dance.png`,
    `${PIXEL}/11-shule-granary-relay.png`, `${PIXEL}/15-cloth-allotment-warehouse.png`,
    `${PIXEL}/16-mechanical-horse-stable.png`,
  ],
  [Era.TURNING_POINT]: [
    '/scenes/scene_turning_alert.png',
    `${PIXEL}/02-hexi-link-lost.png`, `${PIXEL}/14-suyab-evacuation-road.png`,
  ],
  [Era.WASTELAND]: [
    '/scenes/scene_wasteland_hexi.png', '/scenes/scene_wasteland_bunker.png',
    `${PIXEL}/03-kucha-bunker-night-watch.png`, `${PIXEL}/04-white-haired-garrison-gate.png`,
    `${PIXEL}/06-child-courier-bunker.png`, `${PIXEL}/12-beiting-snow-archive.png`,
    `${PIXEL}/13-khotan-jade-relay.png`, `${PIXEL}/17-night-sluice-repair.png`,
  ],
  [Era.GHOST_SIGNAL]: [
    '/scenes/scene_ghost_kucha.png', '/scenes/scene_ghost_suiye.png',
    `${PIXEL}/05-dead-canal-relics.png`, `${PIXEL}/10-black-cube-excavation.png`,
    `${PIXEL}/18-black-sun-dragonbones.png`, `${PIXEL}/19-cracked-bell-low-frequency.png`,
    `${PIXEL}/20-final-signal-chamber.png`,
  ],
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
