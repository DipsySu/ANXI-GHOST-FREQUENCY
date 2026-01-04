import os
import re
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.client import AnxiClient
from core.imager import AnxiImager

# Helper to determine Era
def determine_era(year: int) -> str:
    if 640 <= year <= 750: return "GOLDEN_AGE"
    if 751 <= year <= 760: return "TURNING_POINT"
    if 761 <= year <= 790: return "WASTELAND"
    if 791 <= year <= 808: return "GHOST_SIGNAL"
    return "WASTELAND" # Fallback

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount downloads for image serving
if not os.path.exists("downloads"):
    os.makedirs("downloads")
app.mount("/images", StaticFiles(directory="downloads"), name="images")




# Init Clients
try:
    from core.config import ENABLE_IMAGE_GENERATION
    client = AnxiClient()
    imager = AnxiImager()
except Exception as e:
    print(f"Failed to init core: {e}")
    client = None
    imager = None
    ENABLE_IMAGE_GENERATION = False

class GenerateRequest(BaseModel):
    query: str

@app.post("/api/generate")
async def generate_log(req: GenerateRequest):
    if not client or not imager:
        raise HTTPException(status_code=500, detail="Core services not initialized")
    
    # 1. Generate Log
    log_data = client.generate_log(req.query)
    
    # Extract Year Int for Era logic
    year_match = re.search(r"\d{3}", log_data.get("year_str", ""))
    year = int(year_match.group(0)) if year_match else 700
    era = determine_era(year)
    
    # 2. Generate Image
    image_prompt = log_data.get("image_prompt", "")
    image_url = ""
    # Check Feature Flag
    if ENABLE_IMAGE_GENERATION and image_prompt:
        try:
            local_path = imager.generate_scene(image_prompt)
            if local_path:
                # Convert local path to URL (assuming hosted at root/images)
                filename = os.path.basename(local_path)
                image_url = f"/images/{filename}"
        except Exception as e:
            print(f"Image gen failed: {e}")

    # 3. Construct Response for Frontend
    return {
        "id": "gen-" + str(year), # simplistic ID
        "year": year,
        "location": log_data.get("location"),
        "sender": log_data.get("sender"),
        "signalQuality": log_data.get("signal"),
        "content": log_data.get("content"),
        "era": era,
        "imageUrl": image_url,
        "lastPost": log_data.get("last_post")
    }

# Mount Frontend Build (Static Files) - MOVED TO END TO AVOID SHADOWING API
# We expect the frontend build to be in 'the-anxi-archives/dist' (locally) 
# or '/app/the-anxi-archives/dist' (in docker).
# For dev/hybrid logic:
ui_path = "the-anxi-archives/dist"
if os.path.exists(ui_path):
    app.mount("/", StaticFiles(directory=ui_path, html=True), name="ui")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
