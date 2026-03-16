# app/agents/planner_agent.py

import asyncio
import logging

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.prebuilt import create_react_agent

from app.agents.sql_agent import ask_database
from app.core.config import get_llm
from app.services.gpa_service import get_cgpa
from app.services.memory_service import retrieve_memory, store_memory
from app.tools.planner_tools import (
    calculate_target_gpa,
    check_course_eligibility,
    evaluate_risk,
)

logger = logging.getLogger(__name__)


def _normalize_llm_text(content) -> str:
    if isinstance(content, str):
        return content
    if hasattr(content, "content"):
        content = content.content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict) and "text" in item:
                parts.append(str(item["text"]))
        return "\n".join(parts)
    return str(content)


async def _is_direct_cgpa_request(query: str, llm) -> bool:
    classifier_prompt = f"""
You are an intent classifier for an academic assistant.
Classify the user query into exactly one label:
- direct_cgpa: user asks only for current CGPA/GPA value.
- planner: user asks for advice/simulation/strategy (e.g., improve GPA, how many A+, target GPA, course planning).

User query:
{query}

Return exactly one word: direct_cgpa OR planner
"""
    try:
        response = await llm.ainvoke(classifier_prompt)
        decision = _normalize_llm_text(response).strip().lower()
        decision = decision.replace(".", "").replace('"', "").replace("'", "")
        return decision == "direct_cgpa"
    except Exception as exc:
        logger.warning("CGPA intent classifier fallback to planner due to error: %s", exc)
        return False


def _build_cgpa_answer(cgpa_data: dict) -> str:
    cgpa = cgpa_data.get("cgpa")
    return f"معدلك التراكمي الحالي (CGPA): **{float(cgpa):.3f}**"


async def ask_planner_agent(query: str, user_id: str) -> str:
    try:
        llm = get_llm()

        # Trusted deterministic CGPA snapshot.
        cgpa_data = await asyncio.to_thread(get_cgpa, user_id)
        current_cgpa = cgpa_data.get("cgpa")

        # Fast path: answer only direct current-CGPA questions.
        if await _is_direct_cgpa_request(query, llm) and current_cgpa is not None:
            answer = _build_cgpa_answer(cgpa_data)
            await asyncio.to_thread(store_memory, user_id, "user", query)
            await asyncio.to_thread(store_memory, user_id, "ai", answer)
            return answer

        student_data_query = f"""
        Retrieve the academic profile for user_id: '{user_id}'.
        1. Get ALL semester GPA rows from 'gpa_history' (gpa, total_credits, recorded_at), then compute the latest cumulative CGPA using all rows.
        2. Get ALL student courses from 'student_courses' joined with 'courses' on course_id.
           Include statuses: completed, current, planned.
           Return for each row: status, grade, grade_points, course code, course name, credit_hours, semester_id.
        3. Build a concise summary:
           - completed credits total
           - planned/current credits total
           - count of courses by status
           - list of planned/current courses with their credit hours.
        """
        student_data = await ask_database(student_data_query)

        memory_context = await asyncio.to_thread(retrieve_memory, user_id, query)

        tools = [calculate_target_gpa, check_course_eligibility, evaluate_risk]

        cgpa_context = (
            f"\n[TRUSTED CGPA SNAPSHOT]\n"
            f"- cgpa: {cgpa_data.get('cgpa')}\n"
            f"- total_credits: {cgpa_data.get('total_credits')}\n"
            f"- semesters_count: {cgpa_data.get('semesters_count')}\n"
            if current_cgpa is not None
            else ""
        )

        system_prompt = f"""
        You are the "Academic Planner Agent" for the Faculty of AI at Delta University.
        Your job is to advise students on their academic plans, course registration, and GPA goals.

        [STUDENT CONTEXT (From Database)]
        Here is the student's exact academic data:
        {student_data}
        {cgpa_context}

        [CONVERSATION MEMORY]
        {memory_context}

        [UNIVERSITY RULES - STRICT ENFORCEMENT]
        1. Total credits for graduation: 142 credits.
        2. Academic Load based on CGPA:
           - CGPA < 2.0 (Academic Warning): Maximum 12 credits allowed per semester.
           - CGPA 2.0 to 2.99: Maximum 18 credits allowed per semester.
           - CGPA >= 3.0: Maximum 21 credits allowed per semester.

        [YOUR TOOLS & CAPABILITIES]
        - Use `check_course_eligibility` tool ONLY if the user explicitly asks about a specific course code
          or if you are about to recommend a specific course by code.
        - Use `calculate_target_gpa` tool to simulate GPA targets if asked.
        - Use `evaluate_risk` tool to assess the danger of the planned courses based on student's history.

        [RESPONSE GUIDELINES]
        - Reason, think, and use tools internally in English.
        - Output your FINAL RESPONSE to the student in ELEGANT, ENCOURAGING, AND CLEAR ARABIC.
        - Use markdown (bullet points, bold text) for readability.
        - Never invent courses or grades. Base your recommendations ONLY on the database output and tool results.
        - Do NOT introduce any course code that is not mentioned in the current user question.
        - Do NOT mention database/technical errors unless a tool call in this run actually fails.
        - If the user asks "how many A+ / how to raise GPA" without enough numbers, ask a concise follow-up for:
          target CGPA and planned semester credits (or number of courses and their credit hours).
        - If planned/current courses exist in database, you MUST use their real credit hours in calculations.
        - Never assume "18 credits = 6 courses" unless no planned/current course data exists.
        - If database already has planned/current courses and credits, do not ask the user for data that already exists.
        """

        agent_executor = create_react_agent(llm, tools)
        response = await agent_executor.ainvoke(
            {
                "messages": [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=query),
                ]
            }
        )

        raw_content = response["messages"][-1].content
        if isinstance(raw_content, list):
            final_answer = "\n".join(
                [item.get("text", "") for item in raw_content if isinstance(item, dict)]
            )
            if not final_answer.strip():
                final_answer = str(raw_content)
        else:
            final_answer = str(raw_content)

        await asyncio.to_thread(store_memory, user_id, "user", query)
        await asyncio.to_thread(store_memory, user_id, "ai", final_answer)

        return final_answer

    except Exception as e:
        logger.error(f"CRITICAL ERROR in Planner Agent: {str(e)}", exc_info=True)
        return "عذراً، حدث خطأ أثناء تجهيز الخطة الدراسية. يرجى المحاولة مرة أخرى."
