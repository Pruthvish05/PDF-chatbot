import os

from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

from pdf import extract_text_from_pdf

from vector_services import (
    save_to_vector_store,
    query_vector_store
)

from llm import call_gemini_rag

from schemas import QueryRequest

upload_router = APIRouter()
query_router = APIRouter()


@upload_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    try:

        os.makedirs("data/uploads", exist_ok=True)

        file_path = f"data/uploads/{file.filename}"

        # Save PDF
        with open(file_path, "wb") as f:
            content = await file.read()

            if not content:
                return {
                    "status": "error",
                    "message": "Uploaded file is empty"
                }

            f.write(content)

        print(f"✓ Uploaded file: {file.filename}")

        # Extract text
        text = extract_text_from_pdf(file_path)

        if not text.strip():
            return {
                "status": "error",
                "message": "Could not extract text from PDF"
            }

        print(f"✓ Extracted {len(text)} characters")

        # Save to vector store
        save_to_vector_store(file.filename, text)

        return {
            "status": "success",
            "filename": file.filename,
            "message": "PDF indexed successfully"
        }

    except Exception as e:

        print(f"UPLOAD ERROR: {str(e)}")

        return {
            "status": "error",
            "message": str(e)
        }


@query_router.post("/query")
async def query_doc(req: QueryRequest):

    try:

        print(f"Question: {req.question}")
        print(f"Filename: {req.filename}")

        # Retrieve context
        context = query_vector_store(
            req.filename,
            req.question
        )

        if not context.strip():
            return {
                "status": "success",
                "answer": "No relevant information found in document."
            }

        # LLM Answer
        answer = call_gemini_rag(
            context,
            req.question
        )

        return {
            "status": "success",
            "answer": answer
        }

    except Exception as e:

        print(f"QUERY ERROR: {str(e)}")

        return {
            "status": "error",
            "answer": str(e)
        }