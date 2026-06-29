import { Era, LogData } from '../types';

/**
 * Offline seed transmissions for `?demo=1`. Lets design/QA reach the ReadingSlip
 * (and verify the reading view) without a Gemini key or any network call.
 * One fixture per era; the dug year is carried onto the chosen fixture so the
 * dial/readout stay coherent. Scenes resolve through sceneFor() in assets.ts.
 */
const FIXTURES: Record<Era, Omit<LogData, 'id' | 'year'>> = {
  [Era.GOLDEN_AGE]: {
    location: '龟兹 · 都护府市集（归档残片）',
    sender: '李归尘 (沙狼)',
    signalQuality: '良好',
    content: '调出一卷旧档：开元年间的龟兹，灯火满城，驼铃整夜不歇。\n那时义体满电，矿石的光亮得晃眼。这帮家伙啊——不知道好日子是借来的。\n看着看着就想笑，又想骂。罢了，存着吧。',
    era: Era.GOLDEN_AGE,
    lastPost: '电量 86% · 归档只读',
  },
  [Era.TURNING_POINT]: {
    location: '河西走廊 · 中继烽燧',
    sender: '李归尘 (沙狼)',
    signalQuality: '微弱',
    content: '河西的线，断了。\n往东再发不出去，回波全是雪花。安史那把火，烧穿了驿道。\n还有谁在？替我应一声——哪怕一个字。',
    era: Era.TURNING_POINT,
    lastPost: '电量 41% · 重连中…',
  },
  [Era.WASTELAND]: {
    location: '龟兹地堡 · 四区',
    sender: '李归尘 (沙狼)',
    signalQuality: '微弱',
    content: '铁腿又在漏油了，西边那点矿石的光，快烧没了。\n入夜，墙外的鼓声又起。老赵昨天没扛过去，埋在三区第七格。\n黑立方还亮着绿鬼字，看不懂。也许是长安，也许是鬼，也许是五十年后的谁。\n——还有人收得到吗？替我应一声。',
    era: Era.WASTELAND,
    lastPost: '电量 4% · 上传至 节点 0…',
  },
  [Era.GHOST_SIGNAL]: {
    location: '坐标漂移 · 不可考',
    sender: '李归尘 (沙狼)',
    signalQuality: '严重损坏',
    content: '城没了。人也没了。只剩这方黑立方还在嗡嗡作响。\n我好像看见很多很多年以后，有人隔着屏幕看我。你是谁？\n我叫李归尘。安西，龟兹，第八团。记住一声，就当我没白守。',
    era: Era.GHOST_SIGNAL,
    lastPost: '电量 0% · 信号溶于静电',
  },
};

const eraOf = (year: number): Era =>
  year <= 750 ? Era.GOLDEN_AGE : year <= 760 ? Era.TURNING_POINT : year <= 790 ? Era.WASTELAND : Era.GHOST_SIGNAL;

/** Build a seed log for a query (a year, or a keyword that falls back to the current year). */
export function demoLog(query: string, fallbackYear: number): LogData {
  const m = query.match(/\d{3,4}/);
  const parsed = m ? parseInt(m[0], 10) : NaN;
  const year = Math.max(640, Math.min(808, Number.isFinite(parsed) ? parsed : fallbackYear));
  const era = eraOf(year);
  return { id: `demo-${era}`, year, ...FIXTURES[era] };
}
