from fastapi import APIRouter, File, UploadFile
import fitz
import os

router = APIRouter()

UPLOAD_DIR = "data/uploads"