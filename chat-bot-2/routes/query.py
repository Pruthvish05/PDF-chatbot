from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.vectorstore import query_vector_store
from services.llm import ask_llm

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    filename: str

@router.post("/chat")
async def chat_with_pdf(request: ChatRequest):
    try:
        # 1. Search for the top 3 most relevant chunks in the PDF
        context = query_vector_store(request.filename, request.question)
        
        # 2. Feed that context + the user's question to Gemini 2.0
        answer = ask_llm(request.question, context)
        
        return {"response": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))