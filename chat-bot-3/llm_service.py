# app/services/llm_service.py
# ─────────────────────────────────────────────────────────────
#  SigmaDoxs — LLM Service
#  Calls OpenRouter with Gemini 2.0 Flash.
#  Strictly answers only from provided context chunks.
# ─────────────────────────────────────────────────────────────

import os
import httpx
import logging
import json

logger = logging.getLogger("sigmadoxs.llm_service")

# ── System prompt — RAG-strict instruction ────────────────────
SYSTEM_PROMPT = """You are SigmaDoxs AI, a precise academic research assistant.

CRITICAL RULES — follow them without exception:
1. Answer ONLY using information found in the CONTEXT provided below.
2. If the answer is not present in the context, respond: "I couldn't find that information in the uploaded document."
3. Never hallucinate, speculate, or use outside knowledge.
4. Be concise, clear, and academically rigorous.
5. When relevant, quote short passages from the context to support your answer.
6. Format responses with markdown where it aids readability (bullet points, bold, etc.)."""


async def query_llm(context_chunks: list[str], question: str) -> str:
    """
    Sends context + question to Gemini 2.0 Flash via OpenRouter.
    Returns the model's answer as a string.

    Raises:
        ValueError: If the API key is missing or the response is malformed.
        httpx.HTTPStatusError: On non-2xx responses from OpenRouter.
    """
    # ── Guard: API key must be present ───────────────────────
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key or api_key.startswith("sk-or-v1-YOUR"):
        raise ValueError(
            "OPENROUTER_API_KEY is not configured. "
            "Please add your key to the .env file."
        )

    base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    model    = os.getenv("LLM_MODEL", "google/gemini-2.0-flash-001")

    # ── Build context block ───────────────────────────────────
    if not context_chunks:
        return "I couldn't find that information in the uploaded document."

    context_block = "\n\n---\n\n".join(
        f"[Chunk {i+1}]\n{chunk}" for i, chunk in enumerate(context_chunks)
    )

    user_message = f"""CONTEXT:
{context_block}

QUESTION:
{question}

Answer the question using ONLY the context above."""

    # ── API call ──────────────────────────────────────────────
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1:5500",   # required by OpenRouter
        "X-Title": "SigmaDoxs",
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_message},
        ],
        "temperature": 0.2,   # low temp → more faithful to context
        "max_tokens": 1024,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()

    except httpx.TimeoutException:
        logger.error("OpenRouter request timed out")
        raise ValueError("The AI model timed out. Please try again.")

    except httpx.HTTPStatusError as e:
        logger.error(f"OpenRouter HTTP error {e.response.status_code}: {e.response.text}")
        raise ValueError(f"OpenRouter returned error {e.response.status_code}. Check your API key and quota.")

    # ── Parse response ────────────────────────────────────────
    try:
        data = response.json()
        answer = data["choices"][0]["message"]["content"]
        logger.info(f"LLM returned {len(answer)} character response")
        return answer.strip()

    except (KeyError, IndexError, json.JSONDecodeError) as e:
        logger.error(f"Malformed OpenRouter response: {response.text[:500]}")
        raise ValueError(f"Received an unexpected response format from the AI model: {str(e)}")