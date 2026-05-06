from fastapi import APIRouter, File, UploadFile
import fitz
import os

router = APIRouter()

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@