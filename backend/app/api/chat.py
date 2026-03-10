import logging

from fastapi import APIRouter, Depends
from app.models.chat_models import ChatRequest
from app.orchestration.ai_graph import run_ai_graph
from app.core.auth import AuthUser, get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/api/ask")
async def ask_chat(
    request: ChatRequest,
    current_user: AuthUser = Depends(get_current_user),
):
    try:
        response = await run_ai_graph(
            request.question,
            current_user.user_id,
        )
        return {
            "status": "success",
            "answer": response,
        }
    except Exception as exc:
        logger.exception("Unhandled error in /api/ask: %s", exc)
        return {
            "status": "error",
            "answer": "عذراً، حدث خطأ داخلي مؤقت. يرجى المحاولة مرة أخرى.",
        }
