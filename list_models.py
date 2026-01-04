import os
import traceback
from google import genai
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env", override=True)
api_key = os.getenv("GEMINI_API_KEY")
base_url = os.getenv("BASE_URL")

def list_models():
    print(f"[-] Listing models with key prefix: {api_key[:4] if api_key else 'None'}...")
    print(f"[-] Using Base URL: {base_url}")
    
    if not api_key:
        print("[!] No API Key found.")
        return

    try:
        http_options = {'api_version': 'v1beta'}
        if base_url:
            http_options['base_url'] = base_url

        client = genai.Client(api_key=api_key, http_options=http_options)
        models = client.models.list()
        print("[*] Available Models:")
        for m in models:
            print(f"  - {m.name}")
            
    except Exception as e:
        print(f"[!] Listing Failed: {e}")
        # traceback.print_exc() # simplify output

if __name__ == "__main__":
    list_models()
