from fastapi import APIRouter
from app.models.chat_models import ChatRequest
from app.orchestration.ai_graph import run_ai_graph

router = APIRouter()

@router.post("/api/ask")
async def ask_chat(request: ChatRequest):  # <-- 1. Add 'async' here

    response = await run_ai_graph(         # <-- 2. Add 'await' here
        request.question,
        request.user_id
    )

    return {
        "status": "success",
        "answer": response
    }