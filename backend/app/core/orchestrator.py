from app.core.config import get_llm
from app.tools.tool_registry import TOOLS

llm = get_llm()


SYSTEM_PROMPT = """
You are an AI router for a university academic assistant.

Choose which tool should answer the question.

TOOLS:

1️⃣ search_regulations
Use for:
- university policies
- graduation rules
- academic regulations
- credit requirements

2️⃣ query_student_database
Use for:
- GPA
- completed courses
- grades
- student progress
- semester history

Return ONLY the tool name.
"""


def run_ai_orchestrator(query, user_id):

    prompt = SYSTEM_PROMPT + "\nQuestion: " + query

    tool_name = llm.invoke(prompt).content.strip()

    if tool_name not in TOOLS:
        tool_name = "search_regulations"

    tool = TOOLS[tool_name]

    if tool_name == "search_regulations":
        return tool(query, user_id)

    return tool(query)