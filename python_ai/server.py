from fastapi import FastAPI, Request
from pydantic import BaseModel
from rag_engine import GraphRAG
import uvicorn

app = FastAPI()

# Initialize our RAG Engine
rag = GraphRAG()

class ChatRequest(BaseModel):
    message: str
    user_id: int = 1

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    # 1. Run GNN/Graph Retrieval
    context = rag.retrieve_context(req.message)
    
    # DEBUG: Print context to terminal to verify Graph DB usage
    print(f"\n[DEBUG] Context retrieved from Neo4j:\n{context}\n[END DEBUG]\n")
    
    # 2. Call Gemini/OpenAI with Context
    response = rag.generate_answer(req.message, context)
    
    return {"reply": response, "context_used": context}

@app.post("/train-gnn")
async def train_gnn():
    rag.run_gnn_scoring()
    return {"status": "GNN PageRank Scoring Complete"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
