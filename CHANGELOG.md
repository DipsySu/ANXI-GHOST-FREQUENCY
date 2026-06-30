# Changelog

## v0.0.1 - 安西 · 失落频率

首个可公开访问的里程碑版本。这个版本把项目从一个赛博终端原型推进为完整的“信号考古”体验：用户先进入随机遗址发掘，再通过地下频带调谐 640-808 AD 的安西残存讯号，最终打捞出李归尘和安西都护府的平行大唐档案。

### 体验亮点

- 品牌与叙事统一为“安西 · 失落频率 / Lost Frequency”。
- 首页采用硬 8-bit field-console 风格，强调田野考古、地层频带和黑立方残片。
- 开场发掘流程支持随机遗址、随机古物、像素铲子光标，以及“浮土未开 / 已暴露 / 已回收”的清晰状态反馈。
- 时间轴改为更沉浸的四段频带：都护府在线、河西失链、龟兹守夜、失落频率。
- 打捞内容接入 Gemini，支持按年份或关键词生成安西残存档案。
- 内置像素肖像、场景图和古物图库，让每次进入都有更强的仪式感。

### 技术与部署

- Next.js 16 + React 19 + TypeScript。
- Gemini 文本模型默认使用 `gemini-2.5-flash`。
- 增加 Gemini API 网络/DNS 绕过配置，适配本机和 Vercel 部署环境。
- 已部署到 Vercel 生产环境：https://anxi-ghost-frequency.vercel.app

### 验证

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Vercel production build
- 线上 `/api/generate` smoke test
