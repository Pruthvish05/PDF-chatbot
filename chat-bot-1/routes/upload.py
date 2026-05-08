from email.mime import text

from fastapi import APIRouter, File, UploadFile
import fitz
import os
from services.pdf import extract_text_from_pdf
from services.embedding import get_embedding
from services.vectorstore import save_index
from services.chunk import chunk_text
router = APIRouter()

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename or "uploaded_file.pdf")
    with open(file_path, "wb") as f:
        f.write(await file.read())
    text = extract_text_from_pdf(file_path)
    chunks = chunk_text(text)
    embeddings = [get_embedding(chunk) for chunk in chunks]
    print("TEXT LENGTH:", len(text))
    print("TEXT PREVIEW:", text[:300])
    print("NUMBER OF CHUNKS:", len(chunks))
    print("FIRST CHUNK:", chunks[0] if chunks else "NO CHUNKS")
    print("EMBEDDINGS:", len(embeddings))
    save_index(embeddings, chunks)
    return {"filename": file.filename, "message": "File uploaded and processed successfully.",
        "chunks": len(chunks), "embedding_dim": len(embeddings[0])}

