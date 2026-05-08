import chromadb
from chromadb.config import Settings
import os

# Initialize the Chroma client
# This saves the data to your 'data/index' folder
client = chromadb.PersistentClient(path="data/index")

def save_to_vector_store(chunks: list, filename: str):
    # Create or get a collection for this specific file
    # Chroma doesn't like spaces or special chars in names, so we sanitize
    collection_name = "".join(filter(str.isalnum, filename))
    collection = client.get_or_create_collection(name=collection_name)
    
    # Create IDs for each chunk
    ids = [f"{collection_name}_{i}" for i in range(len(chunks))]
    
    # Add to the database
    # Chroma will automatically handle the 'embeddings' using its default model
    collection.add(
        documents=chunks,
        ids=ids
    )
    return collection_name

def query_vector_store(filename: str, query: str, n_results: int = 3):
    # Sanitize name exactly like we did in save_to_vector_store
    collection_name = "".join(filter(str.isalnum, filename))
    
    try:
        collection = client.get_collection(name=collection_name)
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        if not results['documents'][0]:
            return "No relevant context found in document."
            
        return " ".join(results['documents'][0])
    except Exception as e:
        print(f"VectorStore Query Error: {e}")
        return "" # Return empty context so LLM at least tries to answer