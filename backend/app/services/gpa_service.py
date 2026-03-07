from app.core.config import get_supabase

def get_current_gpa(user_id):

    supabase = get_supabase()

    result = supabase.table("gpa_history") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("recorded_at", desc=True) \
        .limit(1) \
        .execute()

    return result.data


def get_cgpa(user_id):

    supabase = get_supabase()

    result = (
        supabase.table("student_cgpa")
        .select("*")
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    return result.data

def get_semester_gpa(user_id):

    supabase = get_supabase()

    result = (
        supabase.table("gpa_history")
        .select("*")
        .eq("user_id", user_id)
        .order("recorded_at", desc=True)
        .limit(1)
        .execute()
    )

    return result.data