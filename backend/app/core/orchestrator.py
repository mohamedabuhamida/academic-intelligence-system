# backend/app/core/orchestrator.py
from app.agents.rag_agent import ask_academic_mentor
from app.agents.gpa_agent import ask_gpa_agent


def run_ai_orchestrator(query: str, user_id: str):

    q = query.lower()

    if "gpa" in q:
        result = ask_gpa_agent(user_id)
        print("GPA Agent:", result)
        return result

    result = ask_academic_mentor(query, user_id)
    print("RAG Agent:", result)
    return result