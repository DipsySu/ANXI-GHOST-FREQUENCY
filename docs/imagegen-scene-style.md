# 安西 · 失落频率 — Imagegen 场景统一风格

本项目运行时场景图统一为 `public/generated/anxi-pixel/` 下的 512x288 PNG。

## 生成流程

1. 使用内置 `image_gen` 生成单张 16:9 场景。
2. 以现有像素场景和 `10-black-cube-excavation` 打样图作为风格参考。
3. 生成后用 `sharp` 处理为 512x288、palette PNG、约 30-50KB。
4. 在 `app/constants/assets.ts` 的 `SCENES` 中按时期接入。

## 通用提示词骨架

```text
Use case: stylized-concept
Asset type: 16:9 web game scene image for ANXI · Lost Frequency.
Primary request: Create a unified 8-bit / 16-bit pixel-art scene for: <scene topic>.
Scene/backdrop: <period-appropriate Anxi frontier location>.
Subject: <one clear focal object or silhouette>.
Style/medium: crisp low-resolution pixel art game background, limited palette, chunky pixels, hard silhouettes, readable thumbnail composition, no painterly brushwork, no photorealism.
Composition/framing: wide 16:9 landscape or interior, strong focal shape, clean space for terminal UI overlays.
Lighting/mood: <era mood>.
Color palette: deep navy, muted sand, oxidized teal, jade green signal glow, sparse amber highlights.
Text: none.
Constraints: No labels, no UI, no watermark, no readable signs or letters. Keep the image consistent with the referenced pixel scenes.
```

## 场景清单

| File | Era | Topic |
|---|---|---|
| `01-golden-kucha-market.png` | GOLDEN_AGE | Kucha Silk Road market with teal relay lanterns |
| `02-hexi-link-lost.png` | TURNING_POINT | broken Hexi relay tower and severed cable |
| `03-kucha-bunker-night-watch.png` | WASTELAND | Kucha bunker night watch console |
| `04-white-haired-garrison-gate.png` | WASTELAND | old veteran under ruined garrison gate |
| `05-dead-canal-relics.png` | GHOST_SIGNAL | dry canal bed with glowing relics |
| `06-child-courier-bunker.png` | WASTELAND | child courier in bunker corridor |
| `07-khotan-jade-shrine.png` | GOLDEN_AGE | Khotan jade shrine and relay crystal |
| `08-frontier-green-beacon.png` | GOLDEN_AGE | frontier beacon tower with jade signal flame |
| `09-kucha-glitch-dance.png` | GOLDEN_AGE | Kucha dance with teal signal afterimages |
| `10-black-cube-excavation.png` | GHOST_SIGNAL | black cube excavation in desert ruins |
| `11-shule-granary-relay.png` | GOLDEN_AGE | Shule granary logistics relay |
| `12-beiting-snow-archive.png` | WASTELAND | frozen Beiting archive bunker |
| `13-khotan-jade-relay.png` | WASTELAND | abandoned jade relay station |
| `14-suyab-evacuation-road.png` | TURNING_POINT | Suyab evacuation road and fading beacon |
| `15-cloth-allotment-warehouse.png` | GOLDEN_AGE | military cloth allotment warehouse |
| `16-mechanical-horse-stable.png` | GOLDEN_AGE | cyber-Tang mechanical horse stable |
| `17-night-sluice-repair.png` | WASTELAND | night repair at an irrigation sluice |
| `18-black-sun-dragonbones.png` | GHOST_SIGNAL | black sun over buried antenna bones |
| `19-cracked-bell-low-frequency.png` | GHOST_SIGNAL | cracked bronze bell emitting low-frequency rings |
| `20-final-signal-chamber.png` | GHOST_SIGNAL | final buried signal chamber and veteran silhouette |

