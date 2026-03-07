from app.services.gpa_service import get_cgpa, get_semester_gpa


def ask_gpa_agent(user_id, question):

    q = question.lower()

    if "cgpa" in q or "cumulative" in q:

        result = get_cgpa(user_id)

        if result:
            return f"Your current CGPA is {round(result['cgpa'],2)}"

    if "gpa" in q:

        result = get_semester_gpa(user_id)

        if result:
            return f"Your last semester GPA is {result[0]['gpa']}"

    return None