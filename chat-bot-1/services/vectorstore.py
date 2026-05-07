import faiss 
import numpy as np
import os
import pickle

INDEX_PATH="data/index/faiss.index"
CHUNK_PATH="data/index/chunks.pkl"

def save_index(embeddings, chunks):
    if len(embeddings) == 0:
        print("No embeddings to save.")
        return
    dim=len(embeddings[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype("float32"))
    os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)
    faiss.write_index(index, INDEX_PATH)
    os.makedirs(os.path.dirname(CHUNK_PATH), exist_ok=True)
    with open(CHUNK_PATH, 'wb') as f:
        pickle.dump(chunks, f)

def load_index():
    index = faiss.read_index(INDEX_PATH)
    with open(CHUNK_PATH, 'rb') as f:
        chunks = pickle.load(f)
    return index, chunks

def search_similar_chunks(query_embedding, index, chunks, top_k=5):
    D, I = index.search(np.array([query_embedding]), top_k)
    return [(chunks[i], D[0][idx]) for idx, i in enumerate(I[0])]