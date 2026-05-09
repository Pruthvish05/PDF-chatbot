from pydantic import BaseModel

class QueryRequest(BaseModel):
    filename: str
    question: str