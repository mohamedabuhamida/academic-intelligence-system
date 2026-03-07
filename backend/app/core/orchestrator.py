# backend/app/core/orchestrator.py
from app.agents.rag_agent import ask_academic_mentor
from app.agents.gpa_agent import ask_gpa_agent


def run_ai_orchestrator(query: str, user_id: str):

    query_lower = query.lower()

    # GPA questions
    if "gpa" in query_lower or "cgpa" in query_lower or "معدل" in query_lower:
        return ask_gpa_agent(user_id)

    # regulation questions
    return ask_academic_mentor(query, user_id)