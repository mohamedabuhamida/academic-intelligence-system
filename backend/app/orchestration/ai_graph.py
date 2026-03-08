from langgraph.graph import StateGraph
from typing import TypedDict

from app.agents.rag_agent import ask_academic_mentor
from app.tools.sql_agent import ask_database


class AgentState(TypedDict):
    question: str
    user_id: str
    answer: str


def rag_node(state: AgentState):

    response = ask_academic_mentor(
        state["question"],
        state["user_id"]
    )

    state["answer"] = response
    return state


def sql_node(state: AgentState):

    response = ask_database(state["question"])

    state["answer"] = response
    return state

from app.core.config import get_llm

llm = get_llm()


def router(state: AgentState):

    question = state["question"]

    prompt = f"""
Decide which system should answer the question.

SQL → for GPA, courses, grades, credits
RAG → for academic regulations

Question:
{question}

Return only: SQL or RAG
"""

    decision = llm.invoke(prompt).content.strip()

    if "SQL" in decision:
        return "sql"

    return "rag"

