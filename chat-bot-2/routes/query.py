from fastapi import APIRouter, HTTPException
from models.schemas import QueryRequest
from services.embedding import get_query_embedding
from services.vectorstore import load_index, search_similar_chunks
from services.llm import ask_llm

router = APIRouter()

@router.post("/ask")
async def ask_question(request: QueryRequest):
    # 1. Load Index
    index, chunks = load_index()
    if index is None:
        raise HTTPException(status_code=400, detail="No PDF uploaded or indexed yet.")
    
    # 2. Embed Query
    query_vec = get_query_embedding(request.question)
    
    # 3. Retrieve
    relevant_chunks = search_similar_chunks(query_vec, index, chunks)
    
    # 4. LLM Generation
    answer = ask_llm(request.question, relevant_chunks)
    
    return {
        "question": request.question,
        "answer": answer,
        "context_used": relevant_chunks
    }