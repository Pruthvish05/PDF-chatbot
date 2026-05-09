import os

from dotenv import load_dotenv
from pathlib import Path

# Robust .env loading
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if OPENROUTER_API_KEY:
    print("✓ OpenRouter API key detected")
else:
    print("✗ OpenRouter API key NOT found")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from upload import upload_router
from upload import query_router

app = FastAPI(title="SigmaDoxs API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(query_router)


@app.get("/")
def root():
    return {
        "status": "SigmaDoxs Online"
    }


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "openrouter_loaded": bool(OPENROUTER_API_KEY)
    }
