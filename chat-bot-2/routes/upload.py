from fastapi import APIRouter, File, UploadFile
import os
import shutil
from services.pdf import extract_text_from_pdf
from services.chunk import chunk_text
from services.embedding import get_embeddings
from services.vectorstore import save_index

router = APIRouter()

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 1. Extract
    text = extract_text_from_pdf(file_path)
    
    # 2. Chunk
    chunks = chunk_text(text)
    
    # 3. Embed
    embeddings = get_embeddings(chunks)
    
    # 4. Store
    save_index(embeddings, chunks)
    
    return {
        "message": "PDF processed successfully",
        "chunks": len(chunks)
    }