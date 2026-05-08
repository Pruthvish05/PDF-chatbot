import requests
import os
from dotenv import load_dotenv

load_dotenv()

def ask_llm(question: str, context: str):
    api_key ="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"
    if not api_key:
        return "Error: OPENROUTER_API_KEY not found in .env file."

    system_prompt = f"Answer based ONLY on this context: {context}"

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ]
            }
        )
        res_json = response.json()
        
        # Check if 'choices' exists in the response
        if 'choices' in res_json:
            return res_json['choices'][0]['message']['content']
        else:
            print(f"OpenRouter Error: {res_json}")
            return "AI Error: Model failed to respond."
            
    except Exception as e:
        print(f"LLM Service Error: {e}")
        return "Internal Error: Could not connect to LLM."