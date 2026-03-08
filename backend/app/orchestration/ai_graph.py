from langgraph.graph import StateGraph, END
from typing import TypedDict

from app.agents.rag_agent import ask_academic_mentor
from app.tools.sql_agent import ask_database
from app.core.config import get_llm

llm = get_llm()

class AgentState(TypedDict):
    question: str
    user_id: str
    answer: str

# 1. Node functions should return ONLY the keys being updated
def rag_node(state: AgentState):
    response = ask_academic_mentor(
        state["question"],
        state["user_id"]
    )
    return {"answer": response}

def sql_node(state: AgentState):
    response = ask_database(state["question"])
    return {"answer": response}

# 2. Make the router async to safely use LLM inside FastAPI
async def router(state: AgentState):
    question = state["question"]
    prompt = f"""
Decide which system should answer the question.

SQL → for GPA, courses, grades, credits
RAG → for academic regulations

Question:
{question}

Return only: SQL or RAG
"""
    # Use .ainvoke() to prevent blocking the event loop
    decision = (await llm.ainvoke(prompt)).content.strip()

    if "SQL" in decision:
        return "sql"

    return "rag"

builder = StateGraph(AgentState)

builder.add_node("rag", rag_node)
builder.add_node("sql", sql_node)

# 3. Drop the empty router_node and use set_conditional_entry_point
builder.set_conditional_entry_point(
    router,
    {
        "rag": "rag",
        "sql": "sql"
    }
)

# 4. Explicitly map leaf nodes to END so the graph terminates cleanly
builder.add_edge("rag", END)
builder.add_edge("sql", END)

graph = builder.compile()

# 5. Make the execution function async and use graph.ainvoke()
async def run_ai_graph(question, user_id):
    result = await graph.ainvoke({
        "question": question,
        "user_id": user_id
    })
    return result["answer"]