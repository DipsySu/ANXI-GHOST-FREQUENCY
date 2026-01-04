import os
from dotenv import load_dotenv

load_dotenv(override=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_TEXT_MODEL = os.getenv("GEMINI_TEXT_MODEL", "gemini-1.5-pro-latest")
GEMINI_IMAGE_MODEL = os.getenv("GEMINI_IMAGE_MODEL", "gemini-3-pro-image-4k")
BASE_URL = os.getenv("BASE_URL")

# Feature Flags
ENABLE_IMAGE_GENERATION = os.getenv("ENABLE_IMAGE_GENERATION", "true").lower() == "true"

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in .env file.")
