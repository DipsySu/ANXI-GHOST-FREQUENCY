# Anxi Ghost Frequency

> Connecting to the Parallel Tang Dynasty (640-808 AD)

A "Cyber-Archaeology" terminal that simulates connection to a cyberpunk version of the Tang Dynasty's Anxi Protectorate. Enter years or keywords to retrieve digital diaries from soldiers and civilians, accompanied by AI-generated historical/sci-fi scene images.

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## Project Vision

This project combines history with cyberpunk aesthetics, creating an immersive storytelling experience where users explore a timeline spanning:

- **GOLDEN_AGE (640-750)**: High-tech, confident, Neon Tang Dynasty
- **TURNING_POINT (751-760)**: Chaos, disconnection, energy crisis
- **WASTELAND (761-790)**: Ruins, survival, fractured signals
- **GHOST_SIGNAL (791-808)**: Human-machine fusion, wasteland, digital ghosts, despair

---

## Features

- **CLI Interface**: Beautiful terminal UI powered by `rich`
- **Web Interface**: React-based frontend with FastAPI backend
- **AI-Powered**: Text generation via Google Gemini API
- **Image Generation**: AI-generated scene visuals
- **Era System**: Dynamic content based on historical timeline

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+ (for frontend build)
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ANXI-GHOST-FREQUENCY.git
cd ANXI-GHOST-FREQUENCY

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### Running

**CLI Mode:**
```bash
python main.py
```

**Web Mode:**
```bash
# Build frontend
cd the-anxi-archives
npm install
npm run build
cd ..

# Start API server
python api.py
# Visit http://localhost:8000
```

**Docker (Recommended):**
```bash
docker-compose up --build
```

---

## Usage

### CLI Interface

```
Enter Year/Command (e.g. '790')
> 755

[公元755年 | 龟兹城外 | 信号强度: 67%]
FROM: 斥候兵-李
---
今日给义肢上了油，这该死的吐蕃干扰波又强了...
```

### Commands

- Input a year (640-808) to explore that timeline
- Enter keywords like "陌刀", "龟兹", etc.
- Leave empty for random mode
- Type `exit` or `quit` to close

---

## Project Structure

```
ANXI-GHOST-FREQUENCY/
├── core/
│   ├── client.py      # Gemini API wrapper
│   ├── config.py      # Configuration management
│   ├── imager.py      # Image generation
│   └── prompts.py     # AI system prompts
├── the-anxi-archives/ # React frontend
├── api.py             # FastAPI web server
├── main.py            # CLI entry point
├── Dockerfile         # Container configuration
└── requirements.txt   # Python dependencies
```

---

## Configuration

Edit `.env` file:

```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_TEXT_MODEL=gemini-1.5-pro-latest
GEMINI_IMAGE_MODEL=gemini-3-pro-image-4k
BASE_URL=  # Optional: custom API endpoint
```

---

## License

MIT License - see [LICENSE](LICENSE) file.

---

## Credits

Inspired by the fusion of Tang Dynasty history and cyberpunk aesthetics.
