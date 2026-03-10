# app/orchestration/ai_graph.py

from langgraph.graph import StateGraph, END
from typing import TypedDict
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.agents.rag_agent import ask_academic_mentor
from app.agents.planner_agent import ask_planner_agent
from app.core.config import get_llm

class AgentState(TypedDict):
    question: str
    user_id: str
    answer: str

async def rag_node(state: AgentState):
    # مسار الأسئلة العامة واللائحة الأكاديمية
    response = await ask_academic_mentor(
        state["question"],
        state["user_id"]
    )
    return {"answer": response}

async def planner_node(state: AgentState):
    # مسار التخطيط الأكاديمي، الدرجات الشخصية، التسجيل، وتقييم المخاطر
    response = await ask_planner_agent(
        state["question"],
        state["user_id"]
    )
    return {"answer": response}

async def router(state: AgentState):
    """
    Semantic Router: STRICT routing based on exact word match.
    """
    llm = get_llm()
    question = state["question"]

    prompt = ChatPromptTemplate.from_template("""
    You are the central intelligent routing assistant for a university academic system.
    Classify the following user question into EXACTLY ONE of these categories:
    
    - "rag": If the question is STRICTLY about general university rules, regulations, faculties, departments, divisions, or general policies WITHOUT mentioning the student's personal situation or grades.
    - "planner": If the question is about the student's personal data, GPA calculation, specific grades, course registration, semester planning, academic risk, or asking for advice based on their current academic status.
    
    Question: {question}
    
    RESPOND WITH EXACTLY ONE WORD ONLY ("rag" OR "planner"). NO PUNCTUATION, NO EXPLANATION.
    """)

    chain = prompt | llm | StrOutputParser()
    decision = await chain.ainvoke({"question": question})
    
    # تنظيف الرد تماماً عشان ناخد الكلمة الصافية
    decision = decision.strip().lower().replace(".", "").replace("'", "").replace('"', "")
    
    # شرط صارم (Exact Match)
    if decision == "planner":
        return "planner"
    return "rag"

# --- Graph Building ---
builder = StateGraph(AgentState)

builder.add_node("rag", rag_node)
builder.add_node("planner", planner_node)

builder.set_conditional_entry_point(
    router,
    {
        "rag": "rag",
        "planner": "planner"
    }
)

builder.add_edge("rag", END)
builder.add_edge("planner", END)

graph = builder.compile()

async def run_ai_graph(question, user_id):
    result = await graph.ainvoke({
        "question": question,
        "user_id": user_id
    })
    return result["answer"]