# SigmaDoxs ⚡

> High-performance RAG platform for students — built with FastAPI, ChromaDB, and Gemini 2.0 Flash.

---

## Quick Start

### 1. Backend

```bash
# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure your API key
cp .env .env.local               # or just edit .env directly
# → Set OPENROUTER_API_KEY=sk-or-v1-...

# Start the server
python run.py
# Server runs at http://127.0.0.1:8000
# API docs at  http://127.0.0.1:8000/docs
```

### 2. Frontend

Open the `frontend/` folder with **VS Code Live Server** (right-click `index.html` → Open with Live Server).

It will serve on `http://127.0.0.1:5500` — which is already whitelisted in FastAPI CORS.

---

## Project Structure

```
sigmadoxs/
├── app/
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response models
│   ├── routes/
│   │   ├── upload.py           # POST /upload  — PDF ingestion
│   │   └── query.py            # POST /query   — RAG Q&A
│   └── services/
│       ├── pdf_service.py      # PyMuPDF text extraction + chunking
│       ├── vector_service.py   # ChromaDB indexing + retrieval
│       └── llm_service.py      # OpenRouter / Gemini 2.0 Flash
├── data/
│   ├── uploads/                # Temp PDF storage (auto-cleaned)
│   └── index/                  # ChromaDB persistent index
├── frontend/
│   ├── index.html              # Landing / auth page
│   ├── processing.html         # Upload progress (5-stage bar)
│   ├── dashboard.html          # Chat workspace
│   ├── script.js               # Shared auth + token utilities
│   ├── processing.js           # Upload flow + progress animation
│   └── qa.js                   # Chat UI + API integration
├── main.py                     # FastAPI app + CORS
├── run.py                      # Uvicorn launcher
├── requirements.txt
└── .env                        # API keys (never commit this)
```

---

## Architecture

```
User → Frontend (HTML/JS)
         │
         ├── POST /upload  →  pdf_service → chunk_text
         │                 →  vector_service → ChromaDB (local)
         │                 ← { collection_name, chunks_indexed }
         │
         └── POST /query   →  vector_service → top-5 chunks
                           →  llm_service → OpenRouter → Gemini 2.0 Flash
                           ← { answer, sources }
```

---

## Token System

| Action   | Cost |
| -------- | ---- |
| Register | +100 |
| Upload   | −5   |
| Question | −1   |

Stored in `localStorage` per user — purely client-side for the demo.

---

## Key Design Decisions

- **Empty-context fix**: `index_chunks()` calls `client.heartbeat()` after `upsert()`, guaranteeing ChromaDB flushes to disk before the `/upload` 200 OK is sent.
- **Progress bar**: Creeps to 90% across 5 animated stages; only jumps to 100% on confirmed API success.
- **127.0.0.1 everywhere**: Avoids DNS resolution lag that `localhost` can cause on some systems.
- **Strict RAG**: System prompt instructs Gemini to answer only from context — if the answer isn't there, it says so.
- **Error handling**: All LLM calls wrapped in `try/except`; API key absence and malformed JSON both return clean `400` errors with useful messages.

---

## Environment Variables

| Variable              | Default                        | Description             |
| --------------------- | ------------------------------ | ----------------------- |
| `OPENROUTER_API_KEY`  | _(required)_                   | Your OpenRouter API key |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | API base URL            |
| `LLM_MODEL`           | `google/gemini-2.0-flash-001`  | Model identifier        |
| `CHROMA_PERSIST_DIR`  | `./data/index`                 | ChromaDB storage path   |
| `UPLOAD_DIR`          | `./data/uploads`               | Temp PDF storage path   |

---

_SigmaDoxs — Research at the speed of thought._
