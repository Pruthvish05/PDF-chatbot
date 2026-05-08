# app/services/pdf_service.py
# ─────────────────────────────────────────────────────────────
#  SigmaDoxs — PDF Service
#  Handles text extraction from PDFs using PyMuPDF (fitz)
#  and splits the result into overlapping chunks for RAG.
# ─────────────────────────────────────────────────────────────

import fitz  # PyMuPDF
import os
import logging
from pathlib import Path

logger = logging.getLogger("sigmadoxs.pdf_service")


def extract_text_from_pdf(file_path: str) -> str:
    """
    Opens a PDF at `file_path` and extracts all text content.
    Returns a single string with pages separated by double newlines.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF not found at path: {file_path}")

    doc = fitz.open(file_path)
    pages_text = []

    for page_num, page in enumerate(doc):
        text = page.get_text("text")  # plain text extraction
        if text.strip():              # skip blank pages
            pages_text.append(text.strip())

    doc.close()
    full_text = "\n\n".join(pages_text)
    logger.info(f"Extracted {len(full_text)} characters from {Path(file_path).name}")
    return full_text


def chunk_text(
    text: str,
    chunk_size: int = 800,
    overlap: int = 150,
) -> list[str]:
    """
    Splits `text` into overlapping chunks.

    Args:
        text:       Full document text.
        chunk_size: Target character length per chunk.
        overlap:    Characters shared between consecutive chunks
                    to preserve cross-boundary context.

    Returns:
        List of non-empty text chunks.
    """
    chunks: list[str] = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        # Move forward by (chunk_size - overlap) to create the sliding window
        start += chunk_size - overlap

    logger.info(f"Split text into {len(chunks)} chunks (size={chunk_size}, overlap={overlap})")
    return chunks