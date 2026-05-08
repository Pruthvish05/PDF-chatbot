# run.py
# ─────────────────────────────────────────────────────────────
#  SigmaDoxs — Development Server Launcher
#  Run with:  python run.py
# ─────────────────────────────────────────────────────────────

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",   # use 127.0.0.1 — avoids DNS resolution lag vs 'localhost'
        port=8000,
        reload=True,        # hot-reload on file changes during development
        log_level="info",
    )