# Anxi · Lost Frequency (安西 · 失落频率)

> Connecting to the Parallel Tang Dynasty (640-808 AD)

A cyber-archaeology field terminal that recovers lost carrier signals from a cyberpunk version of the Tang Dynasty's Anxi Protectorate. Enter years or keywords to retrieve corrupted frontier logs, accompanied by historical/sci-fi scene images.

![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## Project Vision

This project combines history with cyberpunk aesthetics, creating an immersive storytelling experience where users explore a timeline spanning:

- **PROTECTORATE ONLINE / 都护府在线 (640-750)**: the frontier network at full strength
- **HEXI LINK LOST / 河西失链 (751-760)**: the first fracture in the western corridor
- **KUCHA NIGHT WATCH / 龟兹守夜 (761-790)**: the surviving garrison holds the dark
- **LOST FREQUENCY / 失落频率 (791-808)**: buried carrier waves, bad memory, and fading returns

---

## Features

- **Field Interface**: Next.js with Tailwind CSS
- **Bilingual**: English and Chinese support
- **AI-Powered**: Text generation via Google Gemini API
- **Image Generation**: AI-generated scene visuals using Gemini 3 Pro Image
- **Random Excavation**: site and relic pools make each opening dig feel different
- **Frequency System**: Dynamic content based on historical timeline
- **CRT Effect**: Retro field-terminal aesthetics

---

## Quick Start

### Prerequisites

- Node.js 20+
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local and add your GEMINI_API_KEY
```

### Running

**Development:**
```bash
npm run dev
# Visit http://localhost:3000
```

**Production:**
```bash
npm run build
npm start
```

**Deploy to Vercel:**
```bash
npm i -g vercel
vercel
```

---

## Configuration

Edit `.env.local` file:

```bash
# Required
GEMINI_API_KEY=your_api_key_here

# Optional
# GEMINI_TEXT_MODEL=gemini-2.5-flash
# GEMINI_IMAGE_MODEL=gemini-3-pro-image
# BASE_URL=http://your-proxy-endpoint:port
```

---

## Project Structure

```
ANXI-GHOST-FREQUENCY/
├── app/
│   ├── api/generate/  # API routes
│   ├── components/     # React components
│   ├── constants/      # Translations
│   ├── types.ts        # TypeScript types
│   └── page.tsx        # Main page
├── lib/
│   └── gemini.ts       # Gemini API wrapper
├── public/
│   └── downloads/      # Generated images
└── package.json
```

---

## Usage

Enter a year (640-808 AD) or keyword to retrieve a log entry from the timeline. The AI will generate:

- A diary entry from a soldier or civilian
- An AI-generated scene image
- Signal quality and location info

---

## License

MIT License - see [LICENSE](LICENSE) file.

---

## Credits

Inspired by the fusion of Tang Dynasty history and cyberpunk aesthetics.
