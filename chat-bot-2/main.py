from fastapi import FastAPI
from routes import upload, query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="PDF AI Chatbot Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
# Register Routes
app.include_router(upload.router, tags=["Upload"])
app.include_router(query.router, tags=["Query"])

@app.get("/")
async def root():
    return {"message": "PDF AI Chatbot API is running"}