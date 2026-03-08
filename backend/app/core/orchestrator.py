from app.core.config import get_llm
from app.tools.tool_registry import TOOLS

llm = get_llm()


SYSTEM_PROMPT = """
You are an AI router for an academic assistant system.

Decide which tool should answer the question.

Tools:

1) search_regulations
Use this when the question is about:
- university rules
- academic regulations
- graduation requirements
- policies

2) query_student_database
Use this when the question is about:
- GPA
- courses
- grades
- credits
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