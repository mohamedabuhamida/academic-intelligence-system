from typing import List
from pydantic import BaseModel


class StudySource(BaseModel):
    document_id: str | None = None
    title: str
    excerpt: str | None = None
    source_type: str | None = None
    topic: str | None = None
    week: str | None = None
    lecture_number: str | None = None

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
    sources: List[StudySource] | None = None

