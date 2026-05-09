# SigmaDoxs - Quick Start Guide

## Prerequisites

- Python 3.8+
- pip (Python package manager)
- OpenRouter API Key (https://openrouter.ai)

## Setup Instructions

### 1. Install Dependencies

```bash
pip install fastapi uvicorn python-multipart PyMuPDF chromadb requests python-dotenv
```

### 2. Verify .env File

Make sure `.env` file exists in the root directory with:

```
OPENROUTER_API_KEY=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
```

**Important**: No spaces around the `=` sign!

### 3. Create Required Directories

The application will auto-create these, but to be safe:

```bash
mkdir data/uploads
mkdir data/index
```

### 4. Start the Backend Server

From the project root directory:

```bash
python run.py
```

You should see:

```
SUCCESS: Key loaded (Starts with: sk-or-...)
Uvicorn running on http://127.0.0.1:8000
```

### 5. Open the Frontend

Open your browser and go to:

```
file:///C:/Users/Pruthvish/OneDrive/Desktop/chatbot/index.html
```

## Troubleshooting

### Error: "SigmaDoxs is missing an OpenRouter API key"

- Check that `.env` file exists in the root directory
- Check for spaces in `.env` file (no spaces around `=`)
- Restart the server after fixing `.env`
- Check terminal output shows "SUCCESS: Key loaded..."

### Error: "Connection lost to neural link"

- Make sure backend server is running: `python run.py`
- Check that server is on `http://127.0.0.1:8000`
- Check browser console (F12) for detailed errors
- Look at server terminal for error messages

### Upload fails

- Make sure file is a valid PDF
- Check that `data/uploads` directory exists
- Check server logs for specific errors

### Query returns no answer

- Make sure PDF was successfully uploaded (you'll see "Indexing Complete")
- Try a different question that's more likely to be in the document
- Check that OPENROUTER_API_KEY is valid

## Testing the Full Flow

1. **Start Server**: `python run.py`
2. **Open Browser**: `file:///C:/Users/Pruthvish/OneDrive/Desktop/chatbot/index.html`
3. **Upload PDF**: Click "Select PDF" button
4. **Wait**: See "Indexing Complete" message
5. **Ask Questions**: Type your question and press Enter
6. **Get Answers**: AI will respond based on PDF content

## API Endpoints

- `POST /upload` - Upload PDF file
  - Body: multipart form with `file` field
  - Response: `{status: "success", filename: "..."}` or error

- `POST /query` - Query the indexed document
  - Body: `{filename: "filename.pdf", question: "your question"}`
  - Response: `{status: "success", answer: "..."}`

- `GET /` - Health check
  - Response: `{status: "SigmaDoxs Online"}`

## Files Overview

| File                 | Purpose                      |
| -------------------- | ---------------------------- |
| `index.html`         | Landing page with PDF upload |
| `dashboard.html`     | Chat interface               |
| `processing.html`    | Upload progress page         |
| `api.js`             | Frontend API client          |
| `qa.js`              | Query/answer logic           |
| `run.py`             | Server entry point           |
| `main.py`            | FastAPI app setup            |
| `upload.py`          | Upload/query endpoints       |
| `llm.py`             | LLM integration (OpenRouter) |
| `pdf.py`             | PDF text extraction          |
| `vector_services.py` | ChromaDB vector store        |
| `.env`               | API keys (keep secret!)      |

## Performance Tips

- Keep PDFs under 50MB for faster processing
- Longer documents = longer response time
- You get 100 free tokens - each upload uses 5, each query uses 1
- Rate limiting: Check OpenRouter docs

## Support

If issues persist:

1. Check all error messages in browser console (F12)
2. Check server terminal for backend errors
3. Verify `.env` file syntax
4. Ensure all dependencies are installed: `pip list`
