# app/routes/upload.py
# ─────────────────────────────────────────────────────────────
#  SigmaDoxs — Upload Route
#  POST /upload  →  save PDF, extract text, chunk, index in Chroma.
#  The response is only sent AFTER indexing is fully flushed —
#  this fixes the "empty context" race-condition bug.
# ─────────────────────────────────────────────────────────────

import os
import logging
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from pdf_service    import extract_text_from_pdf, chunk_text
from vector_service import get_safe_name, index_chunks
from schemas          import UploadResponse

logger = logging.getLogger("sigmadoxs.upload")
router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./data/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Accepts a PDF, extracts + chunks text, indexes into ChromaDB.
    Returns only after indexing is complete and flushed to disk.
    """
    # ── Validate file type ────────────────────────────────────
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    collection_name = get_safe_name(file.filename)
    logger.info(f"Upload started: '{file.filename}' → collection '{collection_name}'")

    # ── Save to a temporary file so fitz can open it by path ──
    # We use a named temp file (delete=False) for cross-platform safety.
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf",
            dir=UPLOAD_DIR,
        ) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # ── Extract text ──────────────────────────────────────
        raw_text = extract_text_from_pdf(tmp_path)
        if not raw_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No text could be extracted from this PDF. It may be a scanned image.",
            )

        # ── Chunk ─────────────────────────────────────────────
        chunks = chunk_text(raw_text, chunk_size=800, overlap=150)
        if not chunks:
            raise HTTPException(status_code=422, detail="Failed to split document into chunks.")

        # ── Index — blocks until ChromaDB confirms flush ──────
        # index_chunks() calls client.heartbeat() after upsert,
        # guaranteeing persistence before we return 200 OK.
        total_indexed = index_chunks(collection_name, chunks)

        logger.info(f"Successfully indexed {total_indexed} chunks for '{file.filename}'")

        return UploadResponse(
            success=True,
            filename=file.filename,
            collection_name=collection_name,
            chunks_indexed=total_indexed,
            message=f"Document '{file.filename}' is ready. Ask me anything!",
        )

    except HTTPException:
        raise  # re-raise our own HTTP errors as-is

    except Exception as e:
        logger.exception(f"Unexpected error during upload of '{file.filename}': {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

    finally:
        # Always clean up the temp file
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass