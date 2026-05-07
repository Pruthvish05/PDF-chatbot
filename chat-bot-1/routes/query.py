from fastapi import APIRouter
from models.schemas import QueryRequest
from services.embedding import get_embedding, get_query_embedding
from services.vectorstore import load_index, search_similar_chunks


from services.llm import ask_llm
router = APIRouter()

@router.post("/ask")
async def ask_question(request: QueryRequest):
    index, chunks = load_index()
    query_embedding = get_embedding(request.question)
    relevant_chunks = search_similar_chunks(query_embedding, index, chunks)
    context = "\n".join([chunk for chunk, _ in relevant_chunks])
    answer = ask_llm(request.question, context)
    return{
        "question": request.question,
        "answer": str(answer),
        "relevant_chunks": [str(c) for c in relevant_chunks]
    }