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