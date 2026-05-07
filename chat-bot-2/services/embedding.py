from sentence_transformers import SentenceTransformer
import numpy as np

# Load model once at module level
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embeddings(chunks: list) -> np.ndarray:
    # Ensure output is float32 for FAISS compatibility
    embeddings = model.encode(chunks, convert_to_numpy=True)
    return embeddings.astype('float32')

def get_query_embedding(query: str) -> np.ndarray:
    embedding = model.encode([query], convert_to_numpy=True)
    return embedding.astype('float32')