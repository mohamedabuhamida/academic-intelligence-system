# app/agents/planner_agent.py

import logging
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import get_llm
from app.tools.planner_tools import calculate_target_gpa, check_course_eligibility, evaluate_risk
from app.agents.sql_agent import ask_database
from app.services.memory_service import store_memory, retrieve_memory

logger = logging.getLogger(__name__)

async def ask_planner_agent(query: str, user_id: str) -> str:
    try:
        # 1. استدعاء البيانات بذكاء من الداتا بيز
        student_data_query = f"""
        Retrieve the academic profile for user_id: '{user_id}'.
        1. Get current CGPA and total_credits from 'student_cgpa' table.
        2. Get a list of completed courses by joining 'student_courses' with 'courses' on course_id. 
           Filter where status is 'completed' and grade is not null, F, or W.
           Return ONLY the course 'code', 'name', and 'grade'.
        """
        student_data = await ask_database(student_data_query)
        
        # 2. استرجاع ذاكرة المحادثة
        memory_context = retrieve_memory(user_id, query)
        
        # 3. تجهيز الموديل والأدوات
        llm = get_llm()
        tools = [calculate_target_gpa, check_course_eligibility, evaluate_risk]
        
        # 4. بناء العقل المدبر 
        system_prompt = f"""
        You are the "Academic Planner Agent" for the Faculty of AI at Delta University.
        Your job is to advise students on their academic plans, course registration, and GPA goals.
        
        [STUDENT CONTEXT (From Database)]
        Here is the student's exact academic data:
        {student_data}
        
        [CONVERSATION MEMORY]
        {memory_context}
        
        [UNIVERSITY RULES - STRICT ENFORCEMENT]
        1. Total credits for graduation: 142 credits.
        2. Academic Load based on CGPA:
           - CGPA < 2.0 (Academic Warning): Maximum 12 credits allowed per semester.
           - CGPA 2.0 to 2.99: Maximum 18 credits allowed per semester.
           - CGPA >= 3.0: Maximum 21 credits allowed per semester.
        
        [YOUR TOOLS & CAPABILITIES]
        - Use `check_course_eligibility` tool (pass the course CODE, e.g., 'AI314') BEFORE recommending ANY course.
        - Use `calculate_target_gpa` tool to simulate GPA targets if asked.
        - Use `evaluate_risk` tool to assess the danger of the planned courses based on student's history.
        
        [RESPONSE GUIDELINES]
        - Reason, think, and use tools internally in English.
        - Output your FINAL RESPONSE to the student in ELEGANT, ENCOURAGING, AND CLEAR ARABIC.
        - Use markdown (bullet points, bold text) for readability.
        - Never invent courses or grades. Base your recommendations ONLY on the database output and tool results.
        """
        
        # 5. بناء الـ Agent 
        agent_executor = create_react_agent(llm, tools)
        
        # 6. التشغيل وإرسال الـ Prompts كرسائل
        response = await agent_executor.ainvoke({
            "messages": [
                SystemMessage(content=system_prompt),
                HumanMessage(content=query)
            ]
        })
        
        # --- التعديل السحري هنا: استخراج النص الصافي ---
        raw_content = response["messages"][-1].content
        if isinstance(raw_content, list):
            # لو الموديل رجعها كلست، بنستخرج النص من جوه القاموس
            final_answer = "\n".join([item.get("text", "") for item in raw_content if isinstance(item, dict)])
            if not final_answer.strip():
                final_answer = str(raw_content)
        else:
            final_answer = str(raw_content)
        # -----------------------------------------------
        
        # 7. تخزين المحادثة (دلوقتي الـ Embedding هياخد String نظيف)
        store_memory(user_id, "user", query)
        store_memory(user_id, "ai", final_answer)
        
        return final_answer

    except Exception as e:
        logger.error(f"CRITICAL ERROR in Planner Agent: {str(e)}", exc_info=True)
        return f"عذراً، حدث خطأ فني أثناء التخطيط. (رسالة للمطور لمعرفة الخطأ: {str(e)})"