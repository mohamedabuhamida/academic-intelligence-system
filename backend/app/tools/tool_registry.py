from app.agents.rag_agent import ask_academic_mentor
from backend.app.agents.sql_agent import ask_database

TOOLS = {
    "search_regulations": ask_academic_mentor,
    "query_student_database": ask_database,
}