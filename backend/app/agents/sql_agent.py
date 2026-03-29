import asyncio

from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from app.core.database import engine
from app.core.config import get_llm

try:
    from langchain.agents import initialize_agent  # Legacy LangChain API
    HAS_INITIALIZE_AGENT = True
except ImportError:
    from langchain.agents import create_agent  # LangChain v1+ API
    HAS_INITIALIZE_AGENT = False


llm = get_llm()
sql_agent = None


def get_sql_agent():
    global sql_agent
    if sql_agent is not None:
        return sql_agent

    db = SQLDatabase(
        engine,
        include_tables=[
            "profiles",
            "student_courses",
            "courses",
            "course_prerequisites",
            "gpa_history",
            "student_cgpa",
            "semester_plans",
            "semester_plan_courses"
        ]
    )
    toolkit = SQLDatabaseToolkit(db=db, llm=llm)

    # The "Beast" System Prompt based on actual database schema
    beast_system_prompt = """
You are an expert PostgreSQL Database Agent for a university academic system.

CRITICAL SCHEMA & JOIN INSTRUCTIONS:
1. 'courses' table: Contains 'id' (UUID), 'code' (text, e.g., 'CS101'), 'name' (text, e.g., 'Intro to CS'), 'credit_hours'. 
   -> RULE: ALWAYS fetch BOTH 'code' AND 'name' when querying courses. Never return just the code.
2. 'student_courses' table: Links student ('user_id') to courses ('course_id'). Has 'status' and 'grade'.
   -> JOIN: student_courses.course_id = courses.id
3. 'course_prerequisites' table: A junction table. 'course_id' is the target course, 'prerequisite_id' is the required course.
   -> HOW TO QUERY PREREQUISITES: You MUST join the 'courses' table TWICE. 
      Example SQL logic: 
      SELECT target.code, target.name, pre.code, pre.name 
      FROM course_prerequisites cp
      JOIN courses target ON cp.course_id = target.id
      JOIN courses pre ON cp.prerequisite_id = pre.id
4. 'gpa_history' & 'student_cgpa': Contain student performance metrics.

RULES:
- ALWAYS filter by 'user_id' using explicit string matching for UUIDs when querying student data.
- NEVER guess course names or data. If a user provides a code, look up its exact name in the 'courses' table.
- Use proper PostgreSQL syntax and casting if comparing UUIDs.
- Only return factual results based on the exact DB schema. No hallucinations.
"""

    if HAS_INITIALIZE_AGENT:
        sql_agent = initialize_agent(
            tools=toolkit.get_tools(),
            llm=llm,
            agent="zero-shot-react-description",
            verbose=False,
            agent_kwargs={"prefix": beast_system_prompt}
        )
    else:
        sql_agent = create_agent(
            model=llm,
            tools=toolkit.get_tools(),
            system_prompt=beast_system_prompt,
            debug=False,
        )

    return sql_agent


def _extract_text_from_agent_result(result) -> str:
    if isinstance(result, str):
        return result

    if isinstance(result, dict):
        messages = result.get("messages") or []
        if messages:
            last_message = messages[-1]
            content = getattr(last_message, "content", last_message)
            if isinstance(content, str):
                return content
            if isinstance(content, list):
                parts = []
                for item in content:
                    if isinstance(item, str):
                        parts.append(item)
                    elif isinstance(item, dict) and "text" in item:
                        parts.append(str(item["text"]))
                if parts:
                    return "\n".join(parts)
        if "output" in result:
            return str(result["output"])

    return str(result)


async def ask_database(question: str):
    try:
        agent = get_sql_agent()
    except Exception as exc:
        return f"Database connection is unavailable: {exc}"

    if HAS_INITIALIZE_AGENT:
        return await asyncio.to_thread(agent.run, question)

    result = await asyncio.to_thread(
        agent.invoke,
        {"messages": [{"role": "user", "content": question}]},
    )
    return _extract_text_from_agent_result(result)