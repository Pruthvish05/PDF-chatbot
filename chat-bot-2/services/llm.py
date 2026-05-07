import requests

API_KEY = "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"
URL = "https://openrouter.ai/api/v1/chat/completions"

# 
def ask_llm(question: str, context: list) -> str:
    context_text = "\n---\n".join(context)
    
    prompt = f"Context: {context_text}\n\nQuestion: {question}\nAnswer:"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    
    data = {
        "model": "google/gemma-2-9b-it:free",
        "messages": [{"role": "user", "content": prompt}]
    }
    
    response = requests.post(URL, headers=headers, json=data)
    
    if response.status_code != 200:
        # This will tell you exactly what OpenRouter doesn't like
        print(f"Full Error Response: {response.text}")
        return f"Error {response.status_code}: {response.text}"
        
    result = response.json()
    return result['choices'][0]['message']['content'].strip()