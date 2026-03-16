# app/orchestration/ai_graph.py

import logging
from typing import TypedDict

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import END, StateGraph

from app.agents.planner_agent import ask_planner_agent
from app.agents.rag_agent import ask_academic_mentor
from app.core.config import get_llm

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    question: str
    user_id: str
    answer: str


async def rag_node(state: AgentState):
    response = await ask_academic_mentor(state["question"], state["user_id"])
    return {"answer": response}


async def planner_node(state: AgentState):
    response = await ask_planner_agent(state["question"], state["user_id"])
    return {"answer": response}


async def router(state: AgentState):
    question = state["question"]

    try:
        llm = get_llm()
        prompt = ChatPromptTemplate.from_template(
            """
You are the central intelligent routing assistant for a university academic system.
Classify the following user question into EXACTLY ONE of these categories:

- rag: general university rules/policies not tied to a specific student record.
- planner: personal academic data, GPA, grades, registration, planning, risk, or personalized advice.

Question: {question}

Respond with exactly one word only: rag OR planner.
"""
        )

        chain = prompt | llm | StrOutputParser()
        decision = await chain.ainvoke({"question": question})
        decision = decision.strip().lower().replace(".", "").replace("'", "").replace('"', "")

        if decision in {"rag", "planner"}:
            return decision

        logger.warning("Router returned unexpected label '%s'.", decision)
    except Exception as exc:
        logger.exception("Router failed, switching to heuristic routing: %s", exc)

    q = question.lower()
    personal_keywords = [
        "my",
        "me",
        "gpa",
        "grade",
        "grades",
        "register",
        "registration",
        "courses i",
        "plan",
        "risk",
    ]
    return "planner" if any(k in q for k in personal_keywords) else "rag"


builder = StateGraph(AgentState)
builder.add_node("rag", rag_node)
builder.add_node("planner", planner_node)

builder.set_conditional_entry_point(
    router,
    {
        "rag": "rag",
        "planner": "planner",
    },
)

builder.add_edge("rag", END)
builder.add_edge("planner", END)

graph = builder.compile()


async def run_ai_graph(question, user_id):
    try:
        result = await graph.ainvoke({"question": question, "user_id": user_id})
        return result.get("answer", "عذراً، لم أتمكن من توليد إجابة مناسبة حالياً.")
    except Exception as exc:
        logger.exception("AI graph failed; fallback to planner node: %s", exc)
        return await ask_planner_agent(question, user_id)
