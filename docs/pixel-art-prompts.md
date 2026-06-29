# 安西 · 失落频率 — PixelLab 像素美术提示词包

> 由 `pilex-pixel-art` 技能生成。用于在 PixelLab(或任意像素图生成器)产出**风格统一**的透明素材,替换 `public/sprites/` 下的占位 SVG。

主题:平行大唐 · 安西都护府 · 赛博考古 / 丝绸朋克(silkpunk)。基调 = 锈蚀的唐代器物 + 微弱的玉绿色信号辉光,从尘土里被打捞出来。

---

## 0 · 通用设定(每次生成都套用)

**画布 / 格式**
- 文物图标(relic):`64 × 64 px`,透明背景,单物体居中,占画面约 80%。
- 人物头像(portrait):`64 × 64 px`,半身,透明或纯深底。
- 场景(scene):`128 × 96 px`(4:3),侧视。
- PixelLab 建议:用现有的 `relic_coin.png / relic_chip.png / relic_jade.png` 作 **reference image** 锁住风格;开启 "no background / transparent"。

**STYLE(风格尾巴 — 追加在每条 subject 之后)**
```text
Tang-dynasty silkpunk cyber-archaeology relic, hard square pixels, crisp nearest-neighbor upscale, limited palette (rust bronze #6b4a2a/#c79a5a, jade-green signal glow #35e89a/#5fe07a, steel grey #9aa7a9, gold #e7b24d, cream #d8cdb0, dark outline #0a0c0a), flat cel shading with small pixel clusters, light rust and wear, faint green signal glow, 1-2px dark outline, isolated on transparent background, centered
```

**NEGATIVE(贴进负向提示框)**
```text
photorealistic, 3D render, vector art, smooth illustration, watercolor, soft airbrush, blurred pixels, anti-aliased edges, soft glow everywhere, excessive detail noise, text, labels, watermark, logo, European or Western medieval armor, anime style, glossy plastic, inconsistent scale, background scenery
```

> 中文说明:STYLE 把"唐代锈器 + 玉绿信号辉光 + 硬像素 + 限定色板"固定下来,保证 16 件文物像同一套出土物;NEGATIVE 把欧式盔甲 / 动漫 / 3D / 文字水印挡掉——这是该项目最容易跑偏的几点。

---

## 1 · 文物池(16 件 · 对应 `RELIC_POOL`)

> 每条都是**完整 paste-ready 提示词**(subject + STYLE 已内联)。文件名即目标 `public/sprites/relic_*.png`。

### relic_crystal — 能晶 Energy Crystal
```text
pixel-art game item icon of a single faceted energy ore crystal, glowing jade-green core, darker green side facets, one bright white glint, Tang-dynasty silkpunk cyber-archaeology relic, hard square pixels, crisp nearest-neighbor upscale, limited palette (jade-green signal glow #35e89a/#5fe07a, steel grey, dark outline #0a0c0a), flat cel shading, faint green signal glow, 1-2px dark outline, isolated on transparent background, centered
```
中文:西域"能量晶体",发光矿石,主能源。最亮的一件,带白色高光点。

### relic_gear — 齿轮 Rusted Cog
```text
pixel-art game item icon of a rusted bronze mechanical gear cog with a square center hole, worn teeth, patches of orange rust over steel, Tang silkpunk machinery part, hard square pixels, limited palette (rust bronze #6b4a2a/#c79a5a, steel grey #9aa7a9, dark outline), flat cel shading, light wear, 1-2px dark outline, transparent background, centered
```
中文:机关人/机甲的齿轮,锈蚀,中央方孔(呼应开元通宝的方孔母题)。

### relic_flask — 机油酿 Oil Flask
```text
pixel-art game item icon of a small dark glass bottle of black machine-oil liquor, bronze cap, dark teal-green glass, oily surface with a faint green sheen, one glowing green droplet, Tang silkpunk field flask, hard square pixels, limited palette (dark teal glass, oil black #11160f, bronze #c79a5a, green glow #5fe07a, dark outline), flat shading, transparent background, centered
```
中文:老赵的"机油酿",过滤润滑油兑的酒;深玻璃瓶 + 一滴发绿的油光。

### relic_blade — 陌刀残段 Broken Thermal Mo-Dao
```text
pixel-art game item icon of a broken tip fragment of a Tang thermal mo-dao long blade, brushed steel body with a central groove, glowing hot orange cutting edge fading to yellow, jagged snapped base, Tang silkpunk weapon shard, hard square pixels, limited palette (steel grey #9aa7a9, hot edge #ff7a3a/#ffd089, dark outline), flat shading, transparent background, centered
```
中文:热能陌刀的断尖,刃口still发烫(橙黄),底部是折断的锯齿口。

### relic_cable — 数据线 Data Cable
```text
pixel-art game item icon of a coiled data cable with a metal connector plug, three gold pins on top, dark steel-blue sheath coiling down, a glowing green connector tip at the end, Tang silkpunk wiring, hard square pixels, limited palette (steel grey #9fb0b3, gold pins #e7b24d, dark sheath, green glow #5fe07a, dark outline), flat shading, transparent background, centered
```
中文:连接因陀罗网的数据线 + 接头,末端绿色发光。

### relic_debris — 残骸 Mech Armor Plate
```text
pixel-art game item icon of a broken rusted mech armor plate fragment, riveted bronze surface, one snapped corner, a diagonal crack, a tiny glowing green rune etched on it, Tang silkpunk wreckage, hard square pixels, limited palette (rust bronze #6b4a2a/#8a6a3a, rivet gold #c79a5a, green rune #5fe07a, dark outline), flat shading, heavy wear, transparent background, centered
```
中文:义体/机甲的锈装甲碎片,带铆钉、裂纹、一个发光绿色符文。

### relic_scroll — 绢卷邸报 Silk Edict Scroll
```text
pixel-art game item icon of a rolled cream silk scroll edict, partly unrolled, faded red seal stripe, bronze end-rods, a faint green data-glyph bleeding through the silk, Tang silkpunk document, hard square pixels, limited palette (cream silk #d8cdb0, faded vermilion, bronze, green glow, dark outline), flat shading, transparent background, centered
```
中文:卷起的绢质邸报/诏书,褪色朱印,绢面隐隐透出绿色数据符。

### relic_seal_broken — 断印 Broken Official Seal
```text
pixel-art game item icon of a broken Tang official seal stamp, carved jade-green stone base cracked in two pieces, a bronze knob handle, worn seal-script face, Tang silkpunk authority token, hard square pixels, limited palette (jade green, bronze #c79a5a, dark outline), flat shading, transparent background, centered
```
中文:断裂的官印(玉/铜),裂成两半,呼应"权限密钥"母题。

### relic_tower_core — 信号塔核心 Quantum Tower Core
```text
pixel-art game item icon of a quantum signal-tower core module, a small dark metal cylinder with stacked rings and a glowing jade-green energy band in the middle, antenna stub on top, Tang silkpunk power core, hard square pixels, limited palette (dark steel, jade-green glow #35e89a/#5fe07a, gold trim, dark outline), flat shading, strong green glow, transparent background, centered
```
中文:量子通信塔的核心模块,中段绿色能量环发光——全池辉光最强的一件。

### relic_silk_map — 丝路地图残片 Silk Route Map Fragment
```text
pixel-art game item icon of a torn silk map fragment of the western regions, cream fabric with faded route lines, tiny garrison dots, frayed burnt edges, a faint green grid overlay, Tang silkpunk cartography, hard square pixels, limited palette (cream #d8cdb0, faded ink brown, green grid #5fe07a, dark outline), flat shading, transparent background, centered
```
中文:西域丝路地图残片,焦边,旧驿路线 + 隐约的绿色网格。

### relic_key — 权限密钥 Access Key
```text
pixel-art game item icon of an ornate Tang bronze key fused with a sci-fi keycard, bow shaped like a cloud-scroll motif, gold body with a glowing green keycard chip embedded, Tang silkpunk access token, hard square pixels, limited palette (gold #e7b24d, bronze, green chip #5fe07a, dark outline), flat shading, transparent background, centered
```
中文:"最高权限密钥"——唐式云纹钥匙 + 嵌入的绿色门禁芯片。

### relic_battery — 能量电池 Energy Cell
```text
pixel-art game item icon of a worn energy battery cell used as hard currency, dented metal canister, jade-green charge window on the side showing a half-full glowing bar, faded markings, Tang silkpunk power cell, hard square pixels, limited palette (steel grey, jade-green glow #35e89a, gold, dark outline), flat shading, transparent background, centered
```
中文:当硬通货用的电池;侧面有半满的绿色电量窗(地下赌场赌的就是它)。

### relic_lens — 义眼镜片 Cyber-Eye Lens
```text
pixel-art game item icon of a cybernetic prosthetic eye lens, a round brass-rimmed optic with a glowing jade-green iris and a thin crosshair reticle, small wires trailing from the back, Tang silkpunk ocular implant, hard square pixels, limited palette (brass/bronze, jade-green glow #5fe07a, steel, dark outline), flat shading, transparent background, centered
```
中文:义眼/光学镜片(郭昕的左眼母题),铜框 + 绿色虹膜 + 准星。

### relic_bell — 驼铃 Caravan Bell
```text
pixel-art game item icon of an old bronze caravan camel bell, rounded body with vertical slit, worn patina, a small green signal LED replacing the clapper hole, Tang silkpunk relic, hard square pixels, limited palette (bronze #6b4a2a/#c79a5a, green glow #5fe07a, dark outline), flat shading, light verdigris, transparent background, centered
```
中文:丝路驼铃,绿锈铜身,铃口处嵌了颗绿色信号灯。

### relic_coin — 开元通宝 Coin(现有 PNG · 可重生成统一风格)
```text
pixel-art game item icon of a Tang "Kaiyuan Tongbao" round bronze coin with a square center hole, raised seal-script characters, worn patina, a faint green circuit trace etched around the rim, Tang silkpunk currency, hard square pixels, limited palette (bronze #6b4a2a/#c79a5a, green trace #5fe07a, dark outline), flat shading, transparent background, centered
```
中文:开元通宝方孔铜钱;边缘加一圈淡绿电路纹,呼应阿婆攥着的那枚真铜钱。

### relic_chip — 黑立方碎片 Black-Cube Chip(现有 PNG · 可重生成)
```text
pixel-art game item icon of a small black-cube terminal fragment, dark obsidian chip with glowing green rune circuitry on its faces, one chipped corner, Tang silkpunk mystery device, hard square pixels, limited palette (near-black, jade-green rune #35e89a/#5fe07a, dark outline), flat shading, strong green glow, transparent background, centered
```
中文:神秘"黑立方终端"的碎片,黑曜石质感 + 发绿符文。

### relic_jade — 玉珏 Jade Pendant(现有 PNG · 可重生成)
```text
pixel-art game item icon of a Tang carved jade pendant (bi disk) with a notch, translucent green stone, a silk cord loop, a faint inner green glow as if data is stored inside, Tang silkpunk heirloom, hard square pixels, limited palette (jade greens, cream cord, dark outline), flat shading, transparent background, centered
```
中文:唐式玉珏/玉璧,半透明绿玉,内里像存着数据般发微光。

---

## 2 · 可选 · 其他素材(同 STYLE,改画布)

- **cursor_shovel(挖掘光标)**:`pixel-art icon of a small archaeologist brush and a Luoyang spade crossed` + STYLE,`32×32`,透明。用作扫沙光标。
- **portraits(头像 64×64)**:沙狼/郭昕/老赵/高仙芝/小胡 —— 用 `pilex-pixel-art` 的 *Character Exploration Sheet* 配方,只取 portrait 帧;补一句 `weathered Tang frontier soldier, partial cybernetic implants, no anime`。
- **scenes(场景 128×96 · 4:3)**:用 *Neon Night Panorama*(GHOST/失落频率期)与 *Soft Poster Scene*(GOLDEN/都护府在线期)配方,主体换成龟兹地下掩体 / 量子塔 / 河西废道。

---

## 3 · 接入步骤

1. 在 PixelLab 逐条生成(贴 subject+STYLE,负向贴 NEGATIVE,尺寸按 §0,开 transparent)。
2. 导出透明 PNG,命名为对应 `relic_*.png`,放进 `public/sprites/`。
3. 在 `app/constants/assets.ts` 的 `RELIC_POOL` 里把该项的 `.svg` 改成 `.png`(占位 SVG 可留作 fallback 或删除)。
4. `npm run dev` 抽查;满意后我可以帮你批量改扩展名并清理占位 SVG。

> 若你有 PixelLab 的 API key / MCP,我可以把生成步骤接成脚本,直接吐 PNG 到 `public/sprites/`,跳过手动导出。
