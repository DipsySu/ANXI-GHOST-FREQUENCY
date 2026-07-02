export type AnxiEra = 'GOLDEN_AGE' | 'TURNING_POINT' | 'WASTELAND' | 'GHOST_SIGNAL';

type LifeDetailCard = {
  id: string;
  era: AnxiEra;
  title: string;
  confidence: '明' | '推' | '疑';
  detail: string;
  anchor: string;
  terms: string[];
};

const ERA_LABELS: Record<AnxiEra, string> = {
  GOLDEN_AGE: '640-750 都护府在线',
  TURNING_POINT: '751-760 河西失链',
  WASTELAND: '761-790 龟兹守夜',
  GHOST_SIGNAL: '791-808 失落频率',
};

const LIFE_DETAIL_CARDS: LifeDetailCard[] = [
  {
    id: 'G-01',
    era: 'GOLDEN_AGE',
    title: '三等钱的市集',
    confidence: '明',
    detail: '同一样东西能列上估、次估、下估；干蒲萄一升可报十七、十六、十五文。',
    anchor: '玄奘《大唐西域记》龟兹货币；743年《交河郡市估案》。',
    terms: ['小铜钱', '干蒲萄', '上估', '市司', '牙人'],
  },
  {
    id: 'G-02',
    era: 'GOLDEN_AGE',
    title: '龟兹的乐舞团',
    confidence: '明',
    detail: '五弦琵琶、筚篥、羯鼓、竖箜篌和铜钹能从市集一直响到戍堡外。',
    anchor: '《大唐西域记》屈支条；龟兹乐与苏祗婆传统。',
    terms: ['五弦', '筚篥', '羯鼓', '竖箜篌', '苏幕遮'],
  },
  {
    id: 'G-03',
    era: 'GOLDEN_AGE',
    title: '两座汉僧寺',
    confidence: '明',
    detail: '727年前后，龟兹有大云寺、龙兴寺，汉僧敲钟、写经，也同本地佛寺并坐。',
    anchor: '慧超《往五天竺国传》。',
    terms: ['大云寺', '龙兴寺', '秀行', '法海', '写经'],
  },
  {
    id: 'G-04',
    era: 'GOLDEN_AGE',
    title: '伽蓝百余',
    confidence: '明',
    detail: '龟兹不是空边塞，而是伽蓝百余、僧徒五千的佛国城市。',
    anchor: '《大唐西域记》屈支条。',
    terms: ['伽蓝', '佛龛', '石窟', '说一切有部', '千僧'],
  },
  {
    id: 'G-05',
    era: 'GOLDEN_AGE',
    title: '屯家守边',
    confidence: '推',
    detail: '守边不只是军营，是健儿带家属种麦、修渠、守水口，一人种十亩的日常。',
    anchor: '《唐六典》屯田制与西域屯田分布。',
    terms: ['屯', '健儿', '屯家', '水渠', '苜蓿'],
  },
  {
    id: 'G-06',
    era: 'GOLDEN_AGE',
    title: '戍堡里的精神生活',
    confidence: '明',
    detail: '焉耆镇烽燧里有人抄《孝经》、读《游仙窟》、翻禄命书，也在墙上画涂鸦。',
    anchor: '克亚克库都克烽燧出土文书。',
    terms: ['《孝经》', '《游仙窟》', '禄命书', '习字', '涂鸦'],
  },
  {
    id: 'G-07',
    era: 'GOLDEN_AGE',
    title: '一封没说完的家书',
    confidence: '明',
    detail: '木简上还留着家书开头：“春景渐芳，暄和未尽，不委如何……”',
    anchor: '沙堆烽/克亚克库都克烽燧木简家书。',
    terms: ['家书', '木简', '不委如何', '沙州', '岐州'],
  },
  {
    id: 'G-08',
    era: 'GOLDEN_AGE',
    title: '胡姓戍卒康览延',
    confidence: '明',
    detail: '点名簿里有粟特康姓戍卒康览延，军功还会写进勋告。',
    anchor: '克亚克库都克烽燧勋告文书。',
    terms: ['康览延', '勋告', '萨保', '昭武九姓', '胡汉混编'],
  },
  {
    id: 'G-09',
    era: 'GOLDEN_AGE',
    title: '称价钱',
    confidence: '明',
    detail: '金银、生丝、药材、香料在市上过秤抽税，胡商和牙人围着秤杆说价。',
    anchor: '高昌《内藏奏得称价钱帐》残页。',
    terms: ['称价钱', '生丝', '药材', '香料', '过秤'],
  },
  {
    id: 'T-01',
    era: 'TURNING_POINT',
    title: '怛罗斯的远征',
    confidence: '明',
    detail: '高仙芝从安西出发越葱岭，走三个月到怛逻斯；葛逻禄倒戈，散卒退回。',
    anchor: '怛罗斯之战；杜环《经行记》。',
    terms: ['葱岭', '怛逻斯', '葛逻禄', '陌刀', '散卒'],
  },
  {
    id: 'T-02',
    era: 'TURNING_POINT',
    title: '流落大食十二年的杜环',
    confidence: '明',
    detail: '被俘的杜环在大食漂泊十余年，762年才由海路回国。',
    anchor: '杜佑《通典》所引杜环《经行记》。',
    terms: ['大食', '海舶', '《经行记》', '被俘', '归人'],
  },
  {
    id: 'T-03',
    era: 'TURNING_POINT',
    title: '东去的兵没有回来',
    confidence: '明',
    detail: '安史之乱后边兵东调勤王，营房空了一半，留下老弱和军属守城。',
    anchor: '《资治通鉴》安史乱后边兵内调记载。',
    terms: ['勤王', '东调', '空营', '老弱', '留后'],
  },
  {
    id: 'T-04',
    era: 'TURNING_POINT',
    title: '壮龄应募，华首未归',
    confidence: '明',
    detail: '本该四年换防的人，五十多岁还在超期服役；年轻时应募，白头仍未归家。',
    anchor: '克亚克库都克/沙堆烽烽燧文书。',
    terms: ['换防', '超期', '壮龄应募，华首未归', '白头戍卒', '白发兵'],
  },
  {
    id: 'T-05',
    era: 'TURNING_POINT',
    title: '礼物是一碟酱菜',
    confidence: '明',
    detail: '戍卒拿得出手的馈赠，只是一碟酱菜、几片干菜叶。',
    anchor: '烽燧文书所见馈赠物。',
    terms: ['酱菜', '干菜叶', '馈赠', '配给'],
  },
  {
    id: 'T-06',
    era: 'TURNING_POINT',
    title: '价格开始失真',
    confidence: '推',
    detail: '昨天还按中估的布，今天只认上估；银钱没人收，粮和马料变成硬通货。',
    anchor: '以743年市估三等价体系为基准的叙事推演。',
    terms: ['上估', '囤积', '赊账', '硬通货', '马料'],
  },
  {
    id: 'W-01',
    era: 'WASTELAND',
    title: '声问绝者十余年',
    confidence: '明',
    detail: '安西北庭闭境拒守，数遣使奉表皆不达，声问绝者十余年。',
    anchor: '《资治通鉴》卷227建中二年记载。',
    terms: ['闭境拒守', '奉表', '声问绝', '孤守'],
  },
  {
    id: 'W-02',
    era: 'WASTELAND',
    title: '一封信绕了半个草原才到',
    confidence: '明',
    detail: '使者间道历诸胡，自回鹘中来，才把安西消息送到长安。',
    anchor: '《资治通鉴》卷227；《唐会要》超七资记载。',
    terms: ['间道', '回鹘', '迁七资', '诏书', '使者'],
  },
  {
    id: 'W-03',
    era: 'WASTELAND',
    title: '赶铸的粗钱',
    confidence: '推',
    detail: '边地粗钱边角毛糙，大历元宝、建中通宝和单字钱在窖藏里挤成一团。',
    anchor: '西域铸造说与库车通古斯巴什古城窖藏。',
    terms: ['大历元宝', '建中通宝', '单字钱', '粗陋', '窖藏'],
  },
  {
    id: 'W-04',
    era: 'WASTELAND',
    title: '守城就是守水守麦',
    confidence: '推',
    detail: '断了内地供给后，全城守水口、割苜蓿、签军仓木牒，比守城墙还急。',
    anchor: '《唐六典》屯田工额与孤守屯田推演。',
    terms: ['屯田', '苜蓿', '水口', '军仓', '177工'],
  },
  {
    id: 'W-05',
    era: 'WASTELAND',
    title: '杰谢的税单',
    confidence: '明',
    detail: '于阗杰谢征税收的是粮、布、胡麻、麻子、羊皮，还外加税钱。',
    anchor: '于阗杰谢出土粟特语文书SIP 103.41。',
    terms: ['杰谢', '萨波', '羊皮', '胡麻', '麻子', '地税'],
  },
  {
    id: 'W-06',
    era: 'WASTELAND',
    title: '一座说五种语言的城',
    confidence: '明',
    detail: '于阗文书里汉文、于阗文、粟特文和犹太波斯文并存，契约需要译人。',
    anchor: '和田/于阗多语文书。',
    terms: ['双语契', '于阗文', '粟特文', '犹太波斯文', '译人'],
  },
  {
    id: 'W-07',
    era: 'WASTELAND',
    title: '于阗的小学生',
    confidence: '明',
    detail: '孤城里孩子仍在旧公文背面练字，能把“长安”两个字写一整行。',
    anchor: '和田出土唐代童蒙习字文书。',
    terms: ['习字', '童蒙', '字帖', '旧纸背面'],
  },
  {
    id: 'W-08',
    era: 'WASTELAND',
    title: '迟到的武威郡王',
    confidence: '明',
    detail: '781年迟到十几年的封赏终于送到，郭昕为武威郡王，曹令忠赐名李元忠。',
    anchor: '《资治通鉴》卷227；《赐李元忠郭昕诏》。',
    terms: ['武威郡王', '李元忠', '曹令忠', '宁塞郡王', '诏书'],
  },
  {
    id: 'H-01',
    era: 'GHOST_SIGNAL',
    title: '莫知存亡',
    confidence: '明',
    detail: '正史最后只剩“安西由是遂绝，莫知存亡”；不是战败的镜头，是失声。',
    anchor: '《资治通鉴》。',
    terms: ['遂绝', '莫知存亡', '断片', '失声'],
  },
  {
    id: 'H-02',
    era: 'GHOST_SIGNAL',
    title: '龟兹最后的夜',
    confidence: '疑',
    detail: '808年初冬夜袭可作为本项目传说化终点，不要写成正史定论。',
    anchor: '薛宗正808说；另有分歧。',
    terms: ['元和三年', '夜袭', '殉国', '最后一战'],
  },
  {
    id: 'H-03',
    era: 'GHOST_SIGNAL',
    title: '换了旗号，账簿还在',
    confidence: '推',
    detail: '政权换了，账簿还在；地子、突税、身役、知更、远使继续压到人身上。',
    anchor: '吐蕃统治敦煌税制，作河西比较模型。',
    terms: ['计口授田', '突', '地子', '突税', '知更', '远使'],
  },
  {
    id: 'H-04',
    era: 'GHOST_SIGNAL',
    title: '被重新登记的人',
    confidence: '明',
    detail: '汉人可能被按职能编入僧尼、行人、丝棉、道门亲表等部落，名册重写身份。',
    anchor: '沙州吐蕃部落编制。',
    terms: ['部落', '僧尼部落', '丝棉部落', '阿骨萨', '编户'],
  },
  {
    id: 'H-05',
    era: 'GHOST_SIGNAL',
    title: '岁首才敢穿的唐服',
    confidence: '推',
    detail: '蕃化之下，有人只在岁首偷偷换唐服，向东方遥祭故国。',
    anchor: '吐蕃统治区蕃化政策与沦蕃汉人习俗。',
    terms: ['辫发', '左衽', '唐服', '东向遥祭', '岁首'],
  },
  {
    id: 'H-06',
    era: 'GHOST_SIGNAL',
    title: '嗢末',
    confidence: '推',
    detail: '没蕃汉人壮丁被掠为随军奴，久而久之成了嗢末一类的特殊族群。',
    anchor: '嗢末/浑末族群来源研究。',
    terms: ['嗢末', '随军奴', '没蕃', '壮丁'],
  },
  {
    id: 'H-07',
    era: 'GHOST_SIGNAL',
    title: '缚戎人',
    confidence: '明',
    detail: '逃回唐境的没蕃汉人，因辫发胡服、来历难辨，又被同胞当成戎人。',
    anchor: '白居易、元稹《缚戎人》。',
    terms: ['缚戎人', '没蕃', '归正', '误为戎', '流放'],
  },
  {
    id: 'H-08',
    era: 'GHOST_SIGNAL',
    title: '等到848',
    confidence: '明',
    detail: '河西等到张议潮和归义军，安西却没有等来自己的光复者。',
    anchor: '848年张议潮起义、归义军光复沙州。',
    terms: ['归义军', '张议潮', '光复', '沙州', '无人来'],
  },
];

function hashString(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function eraFromYear(year: number): AnxiEra {
  if (year <= 750) return 'GOLDEN_AGE';
  if (year <= 760) return 'TURNING_POINT';
  if (year <= 790) return 'WASTELAND';
  return 'GHOST_SIGNAL';
}

export function extractYearFromQuery(query: string) {
  const match = query.match(/\b(6[4-9]\d|7\d\d|80[0-8])\b/);
  return match ? Number(match[1]) : undefined;
}

function pickCards(pool: LifeDetailCard[], seed: string, limit: number) {
  return pool
    .map((card, index) => ({ card, score: hashString(`${seed}:${card.id}:${index}`) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, Math.min(limit, pool.length))
    .map(({ card }) => card);
}

export function buildLifeDetailPrompt(query: string) {
  const year = extractYearFromQuery(query);
  const era = year ? eraFromYear(year) : undefined;
  const pool = era ? LIFE_DETAIL_CARDS.filter((card) => card.era === era) : LIFE_DETAIL_CARDS;
  const selected = pickCards(pool, `${query}:${year ?? 'any'}`, 2);
  const target = era ? `${ERA_LABELS[era]}${year ? ` / ${year}年` : ''}` : '未指定年份，按用户关键词和最终年份择用';

  return `【LIFE DETAIL CARDS FOR THIS GENERATION】
Target: ${target}
Use 1-2 selected cards as concrete sensory anchors. Put the detail in hands, mouths, ledgers, food, water, clothing, taxes, names, or tools; do not dump it as exposition.
This is a historical cyberpunk narrative, not a strict exam. Project legends and phrases such as "满城皆是白发兵" may be used as atmosphere, soldier slang, archive myth, or hallucinated slogan, but do not claim legends are exact official records or excavated wording.
If a card is marked 【疑】, use it as rumor/legend/terminal hallucination. If marked 【推】, keep the wording suggestive.

${selected.map((card) => `- ${card.id} ${card.title}【${card.confidence}】: ${card.detail} Anchor: ${card.anchor} Terms: ${card.terms.join(' / ')}`).join('\n')}`;
}
