from app.agents.rag_agent import ask_academic_mentor
from typing import Optional

def ask_question(question: str, user_id: Optional[str] = None):
    return ask_academic_mentor(question, user_id or "anonymous")
