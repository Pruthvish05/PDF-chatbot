import faiss
import pickle
import os
import numpy as np

INDEX_PATH = "data/index/faiss.index"
CHUNKS_PATH = "data/index/chunks.pkl"

def save_index(embeddings: np.ndarray, chunks: list):
    os.makedirs("data/index", exist_ok=True)
    
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    
    faiss.write_index(index, INDEX_PATH)
    
    with open(CHUNKS_PATH, 'wb') as f:
        pickle.dump(chunks, f)

def load_index():
    if not os.path.exists(INDEX_PATH) or not os.path.exists(CHUNKS_PATH):
        return None, None
    
    index = faiss.read_index(INDEX_PATH)
    with open(CHUNKS_PATH, 'rb') as f:
        chunks = pickle.load(f)
    
    return index, chunks

def search_similar_chunks(query_embedding: np.ndarray, index, chunks, k=3):
    # query_embedding expected to be 2D (1, dimension)
    distances, indices = index.search(query_embedding, k)
    
    results = []
    for idx in indices[0]:
        if idx != -1 and idx < len(chunks):
            results.append(chunks[idx])
    return results