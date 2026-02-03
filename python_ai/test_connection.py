import os
from openai import OpenAI
import httpx

print("Testing OpenRouter Connection...")
api_key = os.getenv("OPENROUTER_API_KEY", "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") 

try:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
        http_client=httpx.Client(verify=False) # Test if disabling SSL helps (DEBUG ONLY)
    )
    
    response = client.chat.completions.create(
        model="openai/gpt-4o",
        messages=[
            {"role": "user", "content": "Hello, are you there?"}
        ],
        max_tokens=50
    )
    print("Success!")
    print("Response:", response.choices[0].message.content)

except Exception as e:
    print("Connection Failed!")
    print(f"Error: {e}")
