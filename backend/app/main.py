from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# استيراد المساعد الأكاديمي اللي عملناه
from app.agents.rag_agent import ask_academic_mentor

app = FastAPI(title="Academic AI Mentor API")

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. تعريف شكل البيانات اللي الفرونت إند هيبعتها
class ChatRequest(BaseModel):
    question: str

@app.get("/")
def read_root():
    return {"status": "Academic AI Backend is Online 🚀"}

@app.post("/api/ask")
def ask_question(request: ChatRequest):
    response = ask_academic_mentor(request.question)
    
    return {
        "status": "success",
        "question": request.question,
        "answer": response
    }