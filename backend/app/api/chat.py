from fastapi import APIRouter, Depends
from app.models.chat_models import ChatRequest
from app.orchestration.ai_graph import run_ai_graph
from app.core.auth import AuthUser, get_current_user

router = APIRouter()

@router.post("/api/ask")
async def ask_chat(
    request: ChatRequest,
    current_user: AuthUser = Depends(get_current_user),
):
    response = await run_ai_graph(
        request.question,
        current_user.user_id,
    )

    return {
        "status": "success",
        "answer": response,
    }
