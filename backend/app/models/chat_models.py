from typing import List
from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str
    user_id: str | None = None
    context_mode: str | None = None
    course_id: str | None = None
    course_code: str | None = None
    course_name: str | None = None
    selected_document_ids: List[str] | None = None
    study_mode: str | None = None
    conversation_id: str | None = None

class ChatResponse(BaseModel):
    status: str
    answer: str

