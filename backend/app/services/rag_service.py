from app.agents.rag_agent import ask_academic_mentor

def ask_question(question: str, user_id: str):
    return ask_academic_mentor(question, user_id)
