# app/routes/query.py
# ─────────────────────────────────────────────────────────────
#  SigmaDoxs — Query Route
#  POST /query  →  retrieve context from Chroma, answer via LLM.
# ─────────────────────────────────────────────────────────────

import logging
from fastapi import APIRouter, HTTPException
from vector_service import query_collection
from llm_service  import query_llm
from schemas import QueryRequest, QueryResponse

logger = logging.getLogger("sigmadoxs.query")
router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def query_document(body: QueryRequest):
    """
    1. Retrieves the top-5 relevant chunks from ChromaDB.
    2. Passes them + the user question to Gemini via OpenRouter.
    3. Returns the AI answer along with the source chunks.
    """
    logger.info(f"Query received for collection '{body.collection_name}': {body.question[:80]}")

    # ── Step 1: Vector retrieval ──────────────────────────────
    try:
        context_chunks = query_collection(body.collection_name, body.question, n_results=5)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("ChromaDB query failed")
        raise HTTPException(status_code=500, detail=f"Vector search failed: {str(e)}")

    # ── Step 2: LLM call ──────────────────────────────────────
    try:
        answer = await query_llm(context_chunks, body.question)
    except ValueError as e:
        # Configuration or response-parsing errors → 400-level
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("LLM call failed")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    return QueryResponse(
        answer=answer,
        sources=context_chunks,
        collection_name=body.collection_name,
    )