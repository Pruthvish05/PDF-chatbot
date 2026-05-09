import requests
import os

from dotenv import load_dotenv
from pathlib import Path

# Robust .env loading
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Validate API key
if not OPENROUTER_API_KEY or OPENROUTER_API_KEY.strip() == "":
    raise ValueError(
        "CRITICAL: OPENROUTER_API_KEY missing from .env file"
    )

print("✓ OpenRouter API key loaded successfully")


def call_gemini_rag(context: str, question: str):

    if not context.strip():
        return "No relevant information found in the document."

    print("Calling OpenRouter...")
    print(f"Question: {question}")

    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""
You are SigmaDoxs AI.

Answer the QUESTION using ONLY the provided CONTEXT.

If the answer is not available in the context, say:
"The document does not contain this information."

CONTEXT:
{context}

QUESTION:
{question}
"""

    data = {
        "model": "google/gemini-2.0-flash-001",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    try:

        response = requests.post(
            url,
            headers=headers,
            json=data,
            timeout=30
        )

        print(f"OpenRouter Status: {response.status_code}")

        if response.status_code == 401:
            return "ERROR: Invalid OpenRouter API key."

        if response.status_code == 429:
            return "ERROR: OpenRouter rate limit exceeded."

        if response.status_code >= 400:
            return f"ERROR: {response.status_code} - {response.text}"

        response.raise_for_status()

        result = response.json()

        return result["choices"][0]["message"]["content"]

    except requests.exceptions.ConnectionError:
        return "ERROR: Internet connection failed."

    except Exception as e:
        print(f"LLM Error: {str(e)}")
        return f"SigmaDoxs Error: {str(e)}"