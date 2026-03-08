from langgraph.graph import StateGraph, END
from typing import TypedDict

from app.agents.rag_agent import ask_academic_mentor
from app.tools.sql_agent import ask_database


class AgentState(TypedDict):
    question: str
    user_id: str
    answer: str


async def rag_node(state: AgentState):
    response = await ask_academic_mentor(
        state["question"],
        state["user_id"]
    )
    return {"answer": response}


async def sql_node(state: AgentState):
    response = await ask_database(state["question"])
    return {"answer": response}


async def router(state: AgentState):
    question = state["question"].lower()

    sql_keywords = [
        "gpa",
        "grade",
        "course",
        "credits",
        "semester",
        "passed",
        "failed"
    ]

    if any(k in question for k in sql_keywords):
        return "sql"

    return "rag"


builder = StateGraph(AgentState)

builder.add_node("rag", rag_node)
builder.add_node("sql", sql_node)

builder.set_conditional_entry_point(
    router,
    {
        "rag": "rag",
        "sql": "sql"
    }
)

builder.add_edge("rag", END)
builder.add_edge("sql", END)

graph = builder.compile()


async def run_ai_graph(question, user_id):
    result = await graph.ainvoke({
        "question": question,
        "user_id": user_id
    })

    return result["answer"]