from fastapi import APIRouter, UploadFile, File
from services.pdf import extract_text
from services.chunk import split_text
from services.vectorstore import save_to_vector_store
import os

router = APIRouter()

@router.post("/upload")
async def handle_upload(file: UploadFile = File(...)):
    # 1. Save File
    file_path = f"data/uploads/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # 2. Extract & Chunk
    text = extract_text(file_path)
    chunks = split_text(text)
    
    # 3. Vectorize & Index
    collection_id = save_to_vector_store(chunks, file.filename)
    
    return {
        "status": "success", 
        "filename": file.filename, 
        "collection": collection_id
    }