import uvicorn
import os

if __name__ == "__main__":
    # Ensure directories exist so the code doesn't crash
    os.makedirs("data/uploads", exist_ok=True)
    os.makedirs("data/index", exist_ok=True)
    
    # Run the server
    # reload=True means the server restarts automatically when you save code
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)