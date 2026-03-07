from fastapi import APIRouter
from app.models.chat_models import ChatRequest
from app.core.orchestrator import run_ai_orchestrator

router = APIRouter()


@router.post("/api/ask")
def ask_chat(request: ChatRequest):

    response = run_ai_orchestrator(
        query=request.question,
        user_id=request.user_id
    )

    return {
        "status": "success",
        "answer": response
    }