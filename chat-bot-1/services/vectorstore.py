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
    embeddings = np.asarray(embeddings, dtype='float32')
    if embeddings.ndim == 1:
        embeddings = embeddings.reshape(1, -1)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    print(type(embeddings))
    print("SHAPE:", embeddings.shape)
    print(embeddings)

    index.add(embeddings)
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

def search_similar_chunks(query_embedding, index, chunks, top_k=3):
    query_embedding = query_embedding.astype('float32')
    d,i = index.search(query_embedding,top_k)
    results = []
    for idx in i[0]:
        if idx < len(chunks):
            results.append(chunks[idx])
    return results
