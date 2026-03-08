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


db = SQLDatabase(engine)

llm = get_llm()

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
        system_prompt=(
            "You are a SQL assistant. Use the provided database tools to answer "
            "questions with accurate results."
        ),
        debug=True,
    )


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


def ask_database(question: str):
    if HAS_INITIALIZE_AGENT:
        return sql_agent.run(question)

    result = sql_agent.invoke(
        {"messages": [{"role": "user", "content": question}]}
    )
    return _extract_text_from_agent_result(result)
