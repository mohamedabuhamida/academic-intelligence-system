from fastapi import APIRouter
from app.models.chat_models import ChatRequest
from app.services.rag_service import ask_question

router = APIRouter()

@router.post("/api/ask")
def ask_chat(request: ChatRequest):
    response = ask_question(request.question)
    return {
        "status": "success",
        "answer": response
    }