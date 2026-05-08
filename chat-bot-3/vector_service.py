# app/services/vector_service.py
# ─────────────────────────────────────────────────────────────
#  SigmaDoxs — Vector Service
#  Manages ChromaDB collections: create, upsert, query.
#  Uses Chroma's built-in embedding function (all-MiniLM-L6-v2)
#  so no separate embedding API key is required.
# ─────────────────────────────────────────────────────────────

import re
import os
import logging
import chromadb
from chromadb.utils import embedding_functions

logger = logging.getLogger("sigmadoxs.vector_service")

# ── Singleton ChromaDB client ─────────────────────────────────
from typing import Optional

_client: Optional[chromadb.PersistentClient] = None

def get_client() -> chromadb.PersistentClient:
    global _client
    if _client is None:
        persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./data/index")
        os.makedirs(persist_dir, exist_ok=True)
        _client = chromadb.PersistentClient(path=persist_dir)
        logger.info(f"ChromaDB client initialised at '{persist_dir}'")
    return _client


# ── Default embedding function (local, no API key needed) ─────
_embed_fn = embedding_functions.DefaultEmbeddingFunction()


# ── Helpers ───────────────────────────────────────────────────

def get_safe_name(filename: str) -> str:
    """
    Converts an arbitrary filename into a valid Chroma collection name.
    Rules: 3-63 chars, alphanumeric + hyphens/underscores, no leading/trailing dots.
    """
    # Strip extension, lowercase
    name = os.path.splitext(filename)[0].lower()
    # Replace any non-alphanumeric character with underscore
    name = re.sub(r"[^a-z0-9]+", "_", name)
    # Strip leading/trailing underscores
    name = name.strip("_")
    # Enforce minimum length
    if len(name) < 3:
        name = name + "_doc"
    # Enforce maximum length
    name = name[:63]
    return name


def index_chunks(collection_name: str, chunks: list[str]) -> int:
    """
    Upserts text chunks into a ChromaDB collection.
    Creates the collection if it doesn't exist.
    Returns the number of chunks indexed.

    The collection is persistent — ChromaDB flushes to disk
    automatically after each upsert via PersistentClient.
    """
    client = get_client()

    # get_or_create is idempotent; safe to call on re-uploads
    collection = client.get_or_create_collection(
        name=collection_name,
        embedding_function=_embed_fn,
        metadata={"hnsw:space": "cosine"},
    )

    ids = [f"chunk_{i}" for i in range(len(chunks))]

    # Upsert in a single batch — ChromaDB writes to disk before returning
    collection.upsert(documents=chunks, ids=ids)

    # Force a heartbeat to confirm persistence
    client.heartbeat()

    logger.info(f"Indexed {len(chunks)} chunks into collection '{collection_name}'")
    return len(chunks)


def query_collection(collection_name: str, question: str, n_results: int = 5) -> list[str]:
    """
    Performs a semantic similarity query against the collection.
    Returns the top-n most relevant text chunks.
    """
    client = get_client()

    try:
        collection = client.get_collection(
            name=collection_name,
            embedding_function=_embed_fn,
        )
    except Exception:
        raise ValueError(f"Collection '{collection_name}' not found. Please upload the document first.")

    results = collection.query(
        query_texts=[question],
        n_results=min(n_results, collection.count()),
    )

    docs: list[str] = results.get("documents", [[]])[0]
    logger.info(f"Retrieved {len(docs)} chunks for question in '{collection_name}'")
    return docs