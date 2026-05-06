from fastapi import APIRouter, File, UploadFile
import fitz
import os
from services.pdf import extract_text_from_pdf
router = APIRouter()

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        return {"error": "Only PDF files are allowed."}

    file_path= os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    text = extract_text_from_pdf(file_path)
    
    return{"message": f"File '{file.filename}' uploaded successfully.",
        "file_path": file_path,
        "text": text[:200]}
