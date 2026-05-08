# app/models/schemas.py
# ─────────────────────────────────────────────────────────────
#  SigmaDoxs — Pydantic Schemas
#  Defines request/response shapes for all API endpoints.
# ─────────────────────────────────────────────────────────────

from pydantic import BaseModel, Field
from typing import Optional


class UploadResponse(BaseModel):
    """Returned after a PDF is successfully processed and indexed."""
    success: bool
    filename: str
    collection_name: str
    chunks_indexed: int
    message: str


class QueryRequest(BaseModel):
    """Payload sent by the frontend to query a document."""
    collection_name: str = Field(..., description="Sanitised Chroma collection name returned by /upload")
    question: str = Field(..., min_length=1, max_length=1000, description="User's question")


class QueryResponse(BaseModel):
    """LLM answer plus retrieved context snippets."""
    answer: str
    sources: list[str] = Field(default_factory=list, description="Raw context chunks used for the answer")
    collection_name: str


class ErrorResponse(BaseModel):
    """Standard error envelope."""
    success: bool = False
    detail: str
    error_code: Optional[str] = None