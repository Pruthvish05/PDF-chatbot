from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, query

app = FastAPI(title="SigmaDoxs API")

# VERY IMPORTANT: This allows your HTML files to talk to your Python server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routes you created
app.include_router(upload.router)
app.include_router(query.router)

@app.get("/")
async def root():
    return {"message": "SigmaDoxs Backend is Running"}