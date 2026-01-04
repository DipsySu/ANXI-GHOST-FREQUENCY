from google import genai
from google.genai import types
import json
from .config import GEMINI_API_KEY, GEMINI_TEXT_MODEL, BASE_URL
from .prompts import SYSTEM_PROMPT

class AnxiClient:
    def __init__(self):
        # Configure client with custom base_url if provided
        http_options = {'api_version': 'v1beta'}
        if BASE_URL:
            http_options['base_url'] = BASE_URL

        self.client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options=http_options
        )
        self.model_name = GEMINI_TEXT_MODEL

    def generate_log(self, year: str, keyword: str = ""):
        prompt_text = f"Query Year: {year}"
        if keyword:
            prompt_text += f", Keyword: {keyword}"
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt_text,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json"
                )
            )
            print(f"[DEBUG] Raw Text Response: {response.text}") # Debug log
            
            # Clean up Markdown code blocks if present
            cleaned_text = response.text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            
            return json.loads(cleaned_text.strip())
        except Exception as e:
            print(f"[DEBUG] Full Exception: {e}") # specific debug
            return {
                "log_header": "[SYSTEM ERROR]",
                "log_content": f"Connection Failed: {str(e)}",
                "image_prompt": "Glitch art, system error screen, cyberpunk style"
            }
