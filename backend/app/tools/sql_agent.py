from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain.agents import initialize_agent
from app.core.database import engine
from app.core.config import get_llm


db = SQLDatabase(engine)

llm = get_llm()

toolkit = SQLDatabaseToolkit(db=db, llm=llm)

sql_agent = initialize_agent(
    tools=toolkit.get_tools(),
    llm=llm,
    agent="zero-shot-react-description",
    verbose=True
)


def ask_database(question: str):

    response = sql_agent.run(question)

    return response