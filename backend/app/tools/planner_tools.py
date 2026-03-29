# app/tools/planner_tools.py

import logging
from typing import List
from langchain_core.tools import tool
from app.core.config import get_supabase
from app.services.gpa_service import get_cgpa

logger = logging.getLogger(__name__)

@tool
def calculate_target_gpa(current_cgpa: float, completed_credits: int, target_cgpa: float, planned_credits: int) -> str:
    """
    Calculates the required semester GPA to reach a specific target CGPA.
    """
    try:
        if planned_credits <= 0:
            return "Error: Planned credits must be greater than zero."

        # Calculate Quality Points
        current_quality_points = current_cgpa * completed_credits
        total_future_credits = completed_credits + planned_credits
        target_quality_points = target_cgpa * total_future_credits
        
        required_points = target_quality_points - current_quality_points
        required_gpa = required_points / planned_credits
        
        if required_gpa > 4.0:
            return f"Mathematically IMPOSSIBLE. To reach a {target_cgpa} CGPA, the student needs a semester GPA of {required_gpa:.2f}, which exceeds the 4.0 maximum."
        elif required_gpa <= 0:
            return f"Easily achievable. The student needs a semester GPA of at least 2.0 (passing grade) to maintain or exceed the {target_cgpa} target."
        else:
            return f"POSSIBLE. The student MUST achieve a semester GPA of at least {required_gpa:.2f} across the planned {planned_credits} credits to reach a CGPA of {target_cgpa}."
            
    except Exception as e:
        logger.error(f"Error calculating GPA: {str(e)}")
        return f"Error occurred during calculation: {str(e)}"


@tool
def check_course_eligibility(user_id: str, target_course_code: str) -> str:
    """
    Checks if a student has passed the prerequisites required to register for a specific target course.
    """
    try:
        supabase = get_supabase()
        target_course = target_course_code.strip().upper()
        
        # 1. هات الـ ID بتاع المادة واسمها بناءً على الكود
        course_res = supabase.table("courses").select("id, name").eq("code", target_course).execute()
        if not course_res.data:
            return f"Course {target_course} not found in the database."
        target_course_id = course_res.data[0]["id"]
        target_course_name = course_res.data[0]["name"]
        
        # 2. هات الـ IDs بتاعة المتطلبات السابقة للمادة دي من الجدول الوسيط
        prereq_res = supabase.table("course_prerequisites").select("prerequisite_id").eq("course_id", target_course_id).execute()
        required_prereq_ids = [item["prerequisite_id"] for item in prereq_res.data]
        
        # لو مفيش متطلبات
        if not required_prereq_ids:
            return f"Course {target_course} ({target_course_name}) has NO prerequisites. The student is ELIGIBLE to register."
            
        # نجيب أكواد وأسماء المتطلبات عشان نكتبها للطالب في الرسالة
        codes_res = supabase.table("courses").select("id, code, name").in_("id", required_prereq_ids).execute()
        # هنا التعديل السحري: دمجنا الكود مع الاسم
        prereq_id_to_details = {c["id"]: f"{c['code']} ({c['name']})" for c in codes_res.data}
        
        # 3. هات المواد اللي الطالب خلصها ونجح فيها
        passed_res = supabase.table("student_courses").select("course_id, grade, status").eq("user_id", user_id).execute()
        passed_course_ids = [
            item["course_id"] 
            for item in passed_res.data 
            if item.get("status") == "completed" and item.get("grade") not in ["F", "FF", "W", "NULL", None]
        ]
        
        # 4. المراجعة: هل في حاجة ناقصة؟
        missing_ids = [pid for pid in required_prereq_ids if pid not in passed_course_ids]
        
        if missing_ids:
            missing_details = [prereq_id_to_details[pid] for pid in missing_ids if pid in prereq_id_to_details]
            return f"NOT ELIGIBLE. The student cannot register for {target_course} ({target_course_name}). Missing prerequisites: {', '.join(missing_details)}."
        else:
            required_details = [prereq_id_to_details[pid] for pid in required_prereq_ids if pid in prereq_id_to_details]
            return f"ELIGIBLE. The student has met all prerequisites ({', '.join(required_details)}) and can register for {target_course} ({target_course_name})."
            
    except Exception as e:
        logger.error(f"Error checking eligibility for {target_course_code}: {str(e)}")
        return "Error connecting to the database to check prerequisites."


@tool
def evaluate_risk(user_id: str, planned_courses: List[str]) -> str:
    """
    Evaluates the academic risk of a proposed course plan.
    """
    try:
        supabase = get_supabase()
        planned_courses_upper = [c.strip().upper() for c in planned_courses]
        
        # 1. حساب عدد الساعات المخطط تسجيلها
        courses_res = supabase.table("courses").select("code, credit_hours").in_("code", planned_courses_upper).execute()
        total_planned_credits = sum([c["credit_hours"] for c in courses_res.data]) if courses_res.data else len(planned_courses) * 3
            
        # 2. سحب الـ CGPA الحالي
        cgpa_data = get_cgpa(user_id)
        current_cgpa = float(cgpa_data.get("cgpa")) if cgpa_data.get("cgpa") is not None else 3.0
        
        # 3. تحليل المخاطر
        risk_factors = []
        risk_level = "LOW"
        
        if current_cgpa < 2.0 and total_planned_credits > 12:
            risk_factors.append(f"CRITICAL: CGPA is {current_cgpa}. Planned credits ({total_planned_credits}) exceed the 12 credits limit.")
            risk_level = "HIGH"
            
        elif current_cgpa < 2.5 and total_planned_credits > 15:
            risk_factors.append(f"WARNING: CGPA is {current_cgpa}. Taking {total_planned_credits} credits might be overwhelming.")
            risk_level = "MEDIUM"
        
        if total_planned_credits > 18 and current_cgpa < 3.0:
            risk_factors.append(f"WARNING: Heavy course load ({total_planned_credits} credits). Recommended only for CGPA >= 3.0.")
            risk_level = "HIGH"
        
        if not risk_factors:
            return f"RISK LEVEL: LOW. The planned load ({total_planned_credits} credits) is well-balanced for CGPA ({current_cgpa})."
        
        report = f"RISK LEVEL: {risk_level}\nObservations:\n- " + "\n- ".join(risk_factors)
        return report

    except Exception as e:
        logger.error(f"Error evaluating risk: {str(e)}")
        return "Error connecting to the database to evaluate risk."