from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str
    userid: str

class ChatResponse(BaseModel):
    status: str
    answer: str

