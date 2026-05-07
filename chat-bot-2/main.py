from fastapi import FastAPI
from routes import upload, query

app = FastAPI(title="PDF AI Chatbot Backend")

# Register Routes
app.include_router(upload.router, tags=["Upload"])
app.include_router(query.router, tags=["Query"])

@app.get("/")
async def root():
    return {"message": "PDF AI Chatbot API is running"}