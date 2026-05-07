import requests

API_KEY = "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"
def ask_llm(question,context):
    prompt =f"""Answer the question ONLY using the context below.
If the answer is not found, say:
"Answer not found in document."
Context:
{context}
Question:
{question}
"""
    response = requests.post("https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}", 
                "Content-Type": "application/json"},
        json={"model":"meta-llama/llama-3.1-8b-instruct:free",
            "messages":[
                {
                    "role":"user",
                    "content":prompt
                    }
                ]}
                )
    data = response.json()
    if response.status_code == 200:
        return data["choices"][0]["message"]["content"].strip()
    else:
        return f"Error: {response.status_code} - {response.text}"
