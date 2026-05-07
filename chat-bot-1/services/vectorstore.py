import faiss 
import numpy as np
import os
import pickle

INDEX_PATH="data/index/faiss.index"
CHUNK_PATH="data/index/chunks.pkl"

def save_index(embeddings, chunks):
    dim=len(embeddings[0])
    index = faiss.IndexFlatL2(dim)
    index.add(x=np.array(embeddings))
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
        