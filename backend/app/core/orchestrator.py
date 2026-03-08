# backend/app/core/orchestrator.py
from app.agents.rag_agent import ask_academic_mentor
from app.tools.sql_agent import ask_database


def run_ai_orchestrator(query, user_id):

    q = query.lower()

    if "gpa" in q or "course" in q or "credit" in q:
        return ask_database(query)

    return ask_academic_mentor(query, user_id)