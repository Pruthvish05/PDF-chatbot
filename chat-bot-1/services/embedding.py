from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def get_query_embedding(query):
    embeddings = model.encode(
        [query],
        convert_to_numpy=True,
    )
    return embeddings.astype('float32')

def get_embedding(chunks):
    embeddings = model.encode(
        chunks,
        convert_to_numpy=True,
    )
    return embeddings.astype('float32')