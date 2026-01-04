import os
from datetime import datetime
from io import BytesIO
from PIL import Image
from google import genai
from google.genai import types
from .config import GEMINI_API_KEY, GEMINI_IMAGE_MODEL, BASE_URL

class AnxiImager:
    def __init__(self):
        # Client Configuration
        http_options = {'api_version': 'v1beta'}
        if BASE_URL:
            http_options['base_url'] = BASE_URL

        self.client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options=http_options
        )
        self.model_name = GEMINI_IMAGE_MODEL

    def generate_scene(self, prompt: str) -> str:
        """
        Generates an image using Gemini 3 and saves it to ./downloads/
        """
        if not os.path.exists("downloads"):
            os.makedirs("downloads")

        try:
            # Using User's provided configuration for Gemini 3 Image Gen
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=['IMAGE'],
                    candidate_count=1,
                    image_config=types.ImageConfig(
                        aspect_ratio="4:3" # Using 4:3 to match typical "Retro Terminal" feel, adjustable to 16:9
                    )
                )
            )

            # Parse and Save
            if response.candidates:
                for part in response.candidates[0].content.parts:
                    # Check for inline binary data
                    if part.inline_data:
                        img_data = part.inline_data.data
                        img = Image.open(BytesIO(img_data))
                        
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                        filename = f"downloads/anxi_{timestamp}.png"
                        
                        img.save(filename)
                        return filename
            
            print("[AnxiImager] No image data received.")
            if response.text:
                print(f"[AnxiImager] Model returned text: {response.text}")
            return ""

        except Exception as e:
            print(f"[AnxiImager] Error: {e}")
            return ""
