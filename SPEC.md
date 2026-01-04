这是一份为你准备的 `SPEC.md`。它是为 AI 辅助编程工具（如Antigravity）量身定制的。

这份文档不仅包含了技术细节，还封装了我们刚才讨论的“世界观”和“灵魂”。你只需要把这个文件扔给 AI，它就能理解你要做的不仅仅是一个脚本，而是一个**时空连接器**。

---

# 📄 Project Specification: Anxi Ghost Frequency (安西幽灵频段)

## 1. 项目愿景 (Project Vision)

我们要构建一个基于 Python 的 CLI（命令行）工具，名为 **"Anxi Ghost Frequency"**。
这是一个“赛博考古”终端，它模拟连接到了一个处于平行宇宙的、赛博朋克风格的大唐安西都护府（公元 640-808 年）。
用户通过输入指令（年份、关键词），获取那个时空下士兵或平民的“数字日记”，并实时生成对应的历史/科幻场景图像。

**核心体验目标：** 沉浸感、废土美学、未知探索感 (Roguelike storytelling)。

---

## 2. 技术栈 (Tech Stack)

* **Language:** Python 3.10+
* **Core AI Engine:** Google Gemini 3.5 Pro Preview (via `google-generativeai` SDK)
* *Reason:* 强大的长文本理解能力 + 原生 JSON Mode 输出。


* **Image Generation:** Pollinations.ai API (Free, URL-based generation)
* *Model Preference:* Flux or similar high-quality realistic models.


* **UI/UX Library:** `rich`
* *Reason:* 用于构建黑客风格的 Terminal 界面（Markdown 渲染、加载动画、边框面板）。


* **Configuration:** `.env` file for API Keys.

---

## 3. 功能需求 (Functional Requirements)

### 3.1 初始化 (Initialization)

* 程序启动时，显示酷炫的 ASCII Art 标题。
* 加载 `.env` 中的 `GEMINI_API_KEY`。
* 初始化 Gemini 客户端，配置 System Instruction。

### 3.2 交互循环 (The Loop)

1. **Input:** 显示类似 Linux 终端的提示符（如 `root@Anxi-Core:~$`），等待用户输入。
* 用户可输入：年份（"755"）、关键词（"陌刀"）、或者为空（触发随机模式）。
* 特殊指令：`exit` / `quit` 退出程序。


2. **Processing (Text):** 将用户输入发送给 Gemini。
* 使用 Loading Spinner 动画（文案：`正在连接时空信道...`）。
* Gemini **必须** 返回严格的 JSON 格式。


3. **Display (Text):** 解析 JSON，使用 `rich.markdown` 和 `rich.panel` 渲染日志内容。
* 显示时间戳、信号质量、日志正文。


4. **Processing (Image):** 提取 JSON 中的 `image_prompt` 字段。
* 调用绘图 API 下载图片。
* 使用 Loading Spinner 动画（文案：`正在重构视觉信号...`）。
* 图片保存至本地 `./downloads/` 目录，文件名带时间戳。


5. **Completion:** 提示图片保存路径，准备下一次输入。

---

## 4. 数据结构与提示词工程 (Data & Prompts)

### 4.1 System Prompt (核心人设)

这是项目的灵魂。AI Agent 需要将以下设定硬编码进 `SYSTEM_PROMPT` 变量中：

> **角色：** "大唐安西都护府" 战术网络中残存的 AI 记录核心（代号：天枢）。
> **数据库范围：** 公元 640 年（建制）- 808 年（彻底沉寂）。
> **世界观：** 历史真实（安史之乱、吐蕃围城）与 赛博幻想（外骨骼、聚变电池、全息影像）的结合。
> **演变逻辑：**
> * 早期（640-750）：高科技、自信、霓虹盛唐。
> * 中期（755-790）：混乱、断联、能源危机。
> * 晚期（790-808）：人机融合的极限、废土、数字幽灵、绝望。
> 
> 

### 4.2 JSON Schema (输出协议)

Gemini 的 `generation_config` 必须设置为 `response_mime_type="application/json"`。
返回结构如下：

```json
{
  "type": "object",
  "properties": {
    "log_header": {
      "type": "string",
      "description": "格式如：[公元790年 | 龟兹地下三层 | 信号强度: 12%]"
    },
    "log_content": {
      "type": "string",
      "description": "第一人称日记内容。混合古文风与赛博术语。例如：'今日给义肢上了油，这该死的吐蕃干扰波又强了。'"
    },
    "image_prompt": {
      "type": "string",
      "description": "用于AI绘图的英文提示词。包含主体、环境、光影、风格（Cyberpunk, Tang Dynasty aesthetics, realistic, cinematic lighting）。"
    }
  }
}

```

---

## 5. 接口规范 (API Specifications)

### 5.1 Image Generation (Pollinations.ai)

* **Base URL:** `https://image.pollinations.ai/prompt/{encoded_prompt}`
* **Parameters:**
* `width`: 1024
* `height`: 768
* `model`: `flux` (推荐，画质较好) or `turbo`
* `nologo`: `true`


* **Logic:** 对 `image_prompt` 进行 URL Encode 拼接后发起 GET 请求，保存 Binary Response。

---

## 6. 文件结构建议 (File Structure)

```text
anxi-ghost/
├── .env                # 存放 GEMINI_API_KEY
├── requirements.txt    # google-generativeai, rich, requests
├── main.py             # 主入口与UI循环
├── core/
│   ├── client.py       # Gemini API 封装
│   ├── prompts.py      # 存放长文本 System Prompt
│   └── imager.py       # 处理图片下载逻辑
└── downloads/          # 存放生成的图片

```

---

## 7. 待办事项 (Action Plan for Agent)

1. Setup Python environment and install dependencies.
2. Create project structure.
3. Implement `core/prompts.py` with the full "Anxi Archives" world-building text.
4. Implement `core/client.py` to handle Gemini JSON interaction.
5. Implement `core/imager.py` to handle Pollinations URL construction and downloading.
6. Build `main.py` with `rich` library to tie everything together.
7. **Test Case:** Input "790年" and verify if a JSON is parsed and an image is saved.

---

