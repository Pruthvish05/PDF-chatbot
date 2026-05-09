import chromadb
import re
import os

# Ensure data dir exists
os.makedirs("data/index", exist_ok=True)
client = chromadb.PersistentClient(path="data/index")

def get_safe_name(name: str) -> str:
    # Sanitizes filename to Chroma-compliant collection name
    clean = re.sub(r'[^a-zA-Z0-9]', '', name).lower()
    return clean[:63] if len(clean) >= 3 else f"col_{clean}"[:63]

def save_to_vector_store(filename: str, text: str):
    collection_name = get_safe_name(filename)
    # Delete existing to avoid duplicates for same file
    try: client.delete_collection(collection_name)
    except: pass
    
    collection = client.create_collection(name=collection_name)
    
    # Simple chunking (1000 chars)
    chunks = [text[i:i+1000] for i in range(0, len(text), 1000)]
    ids = [f"id_{i}" for i in range(len(chunks))]
    
    collection.add(documents=chunks, ids=ids)
    return collection_name

def query_vector_store(filename: str, query: str):
    collection_name = get_safe_name(filename)
    collection = client.get_collection(name=collection_name)
    results = collection.query(query_texts=[query], n_results=3)
    return "\n".join(results['documents'][0])