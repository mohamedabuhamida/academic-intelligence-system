from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str
    user_id: str | None = None

class ChatResponse(BaseModel):
    status: str
    answer: str

