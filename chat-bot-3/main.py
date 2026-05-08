# main.py
# ─────────────────────────────────────────────────────────────
#  SigmaDoxs — FastAPI Application Entry Point
# ─────────────────────────────────────────────────────────────

import logging
from dotenv import load_dotenv
load_dotenv()   # must be first so env vars are available to all modules

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from upload import router as upload_router
from query  import router as query_router

# ── Logging ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("sigmadoxs.main")

# ── App ───────────────────────────────────────────────────────
app = FastAPI(
    title="SigmaDoxs API",
    description="High-performance RAG platform for students",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────
# Allow the VS Code Live Server origin and localhost variants.
# For production, replace "*" with your actual domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "*",                       # dev convenience — restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(upload_router, tags=["Upload"])
app.include_router(query_router,  tags=["Query"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "SigmaDoxs API", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}