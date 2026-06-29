export type DigSite = {
  name: string;
  code: string;
  depth: string;
  mark: string;
  en: string;
};

export const DIG_SITES: DigSite[] = [
  { name: '龟兹北垣', code: 'KUQA-N07', depth: '7.4m', mark: '北垣塌墙', en: 'Kucha North Wall' },
  { name: '疏勒旧仓', code: 'SHULE-G12', depth: '5.8m', mark: '军仓灰层', en: 'Shule Granary' },
  { name: '拨换城水渠', code: 'BOHUAN-C03', depth: '6.1m', mark: '暗渠淤沙', en: 'Bohuan Canal' },
  { name: '轮台烽燧', code: 'LUNTAI-B19', depth: '4.6m', mark: '烽燧余烬', en: 'Luntai Beacon' },
  { name: '焉耆盐井', code: 'YANQI-S05', depth: '8.2m', mark: '盐壳断面', en: 'Yanqi Salt Well' },
  { name: '于阗旧驿', code: 'KHOTAN-P02', depth: '5.2m', mark: '驿道砂层', en: 'Khotan Relay' },
  { name: '碎叶驿道', code: 'SUYAB-R08', depth: '6.7m', mark: '驿道石痕', en: 'Suyab Road' },
  { name: '白草军台', code: 'BAICAO-T16', depth: '3.9m', mark: '军台灰坑', en: 'Baicao Watchpost' },
];

export function randomDigSite(): DigSite {
  return DIG_SITES[Math.floor(Math.random() * DIG_SITES.length)] ?? DIG_SITES[0];
}
