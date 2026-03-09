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
        "semester_plans",
        "semester_plan_courses"
    ]
)
    toolkit = SQLDatabaseToolkit(db=db, llm=llm)

    if HAS_INITIALIZE_AGENT:
        sql_agent = initialize_agent(
            tools=toolkit.get_tools(),
            llm=llm,
            agent="zero-shot-react-description",
            verbose=True,
        )
    else:
        sql_agent = create_agent(
            model=llm,
            tools=toolkit.get_tools(),
            system_prompt = """
You are a database expert for a university academic system.

Database schema includes:
- profiles
- student_courses
- courses
- course_prerequisites
- gpa_history

Rules:
- Always filter by user_id when querying student data
- NEVER guess data
- Use joins when necessary
- Only return factual results from the database
""",
            debug=True,
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
        return agent.run(question)

    result = agent.invoke(
        {"messages": [{"role": "user", "content": question}]}
    )
    return _extract_text_from_agent_result(result)
