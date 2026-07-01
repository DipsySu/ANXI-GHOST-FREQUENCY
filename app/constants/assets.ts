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
 * Pre-generated era scenes — 8-bit pixel scenes + cinematic concept art, mixed per era;
 * sceneFor() picks one deterministically per log. Concept masters live full-res under
 * /public/generated/anxi-general (PNG, git-ignored); the committed runtime copies are the
 * web-optimized .jpg below. Drop a new image into the right era array to add it to rotation.
 */
const GEN = '/generated/anxi-general';
const SCENES: Record<Era, string[]> = {
  [Era.GOLDEN_AGE]: [
    '/scenes/scene_golden_kucha.png', '/scenes/scene_golden_market.png',
    `${GEN}/01-golden-kucha-market.jpg`, `${GEN}/07-khotan-jade-shrine.jpg`,
    `${GEN}/08-frontier-green-beacon.jpg`, `${GEN}/09-kucha-glitch-dance.jpg`,
    `${GEN}/11-shule-granary-relay.jpg`, `${GEN}/15-cloth-allotment-warehouse.jpg`,
    `${GEN}/16-mechanical-horse-stable.jpg`,
  ],
  [Era.TURNING_POINT]: [
    '/scenes/scene_turning_alert.png',
    `${GEN}/02-hexi-link-lost.jpg`, `${GEN}/14-suyab-evacuation-road.jpg`,
  ],
  [Era.WASTELAND]: [
    '/scenes/scene_wasteland_hexi.png', '/scenes/scene_wasteland_bunker.png',
    `${GEN}/03-kucha-bunker-night-watch.jpg`, `${GEN}/04-white-haired-garrison-gate.jpg`,
    `${GEN}/06-child-courier-bunker.jpg`, `${GEN}/12-beiting-snow-archive.jpg`,
    `${GEN}/13-khotan-jade-relay.jpg`, `${GEN}/17-night-sluice-repair.jpg`,
  ],
  [Era.GHOST_SIGNAL]: [
    '/scenes/scene_ghost_kucha.png', '/scenes/scene_ghost_suiye.png',
    `${GEN}/05-dead-canal-relics.jpg`, `${GEN}/10-black-cube-excavation.jpg`,
    `${GEN}/18-black-sun-dragonbones.jpg`, `${GEN}/19-cracked-bell-low-frequency.jpg`,
    `${GEN}/20-final-signal-chamber.jpg`,
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
