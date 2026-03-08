from fastapi import APIRouter
from app.models.chat_models import ChatRequest
from app.orchestration.ai_graph import run_ai_graph

router = APIRouter()


@router.post("/api/ask")
def ask_chat(request: ChatRequest):

    response = run_ai_graph(
        request.question,
        request.user_id
    )

    return {
        "status": "success",
        "answer": response
    }