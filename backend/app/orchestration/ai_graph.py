from langgraph.graph import StateGraph
from typing import TypedDict

from app.agents.rag_agent import ask_academic_mentor
from app.tools.sql_agent import ask_database
from app.core.config import get_llm

llm = get_llm()


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

def router_node(state: AgentState):
    return state

builder = StateGraph(AgentState)

builder.add_node("router", router_node)
builder.add_node("rag", rag_node)
builder.add_node("sql", sql_node)
builder.add_conditional_edges(
    "router",
    router,
    {
        "rag": "rag",
        "sql": "sql"
    }
)

builder.set_entry_point("router")

graph = builder.compile()

def run_ai_graph(question, user_id):

    result = graph.invoke({
        "question": question,
        "user_id": user_id
    })

    return result["answer"]
