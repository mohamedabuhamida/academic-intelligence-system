import logging

from fastapi import APIRouter, Depends
from app.models.chat_models import ChatRequest
from app.orchestration.ai_graph import run_ai_graph
from app.core.auth import AuthUser, get_current_user
from app.agents.rag_agent import ask_study_assistant

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/api/ask")
async def ask_chat(
    request: ChatRequest,
    current_user: AuthUser = Depends(get_current_user),
):
    try:
        if request.context_mode == "study":
            if not request.course_id:
                return {
                    "status": "error",
                    "answer": "يرجى اختيار المادة أولًا قبل بدء شات المذاكرة.",
                }

            response = await ask_study_assistant(
                query=request.question,
                user_id=current_user.user_id,
                course_id=request.course_id,
                course_code=request.course_code,
                course_name=request.course_name,
            )
            return {
                "status": "success",
                "answer": response,
            }

        question = request.question

        if request.context_mode == "study" and (request.course_code or request.course_name):
            course_label = " - ".join(
                part for part in [request.course_code, request.course_name] if part
            )
            question = (
                f"{request.question}\n\n"
                f"[STUDY CHAT CONTEXT]\n"
                f"The student explicitly selected this current-semester course before asking: {course_label}.\n"
                f"Keep the answer focused on that subject unless the student asks to compare with another course."
            )

        response = await run_ai_graph(
            question,
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
