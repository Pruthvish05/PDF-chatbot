import uvicorn
import os

if __name__ == "__main__":
    # Ensure directories exist before starting
    os.makedirs("data/uploads", exist_ok=True)
    os.makedirs("data/index", exist_ok=True)
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)