from __future__ import annotations

from typing import Any

from app.core.config import get_supabase


def _to_float(value: Any) -> float | None:
    try:
        if value is None:
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_int(value: Any) -> int | None:
    try:
        if value is None:
            return None
        return int(value)
    except (TypeError, ValueError):
        return None


def get_semester_gpa(user_id: str) -> list[dict]:
    """
    Returns ALL semester GPA rows (old function name kept for compatibility).
    """
    supabase = get_supabase()
    result = (
        supabase.table("gpa_history")
        .select("id, user_id, gpa, total_credits, recorded_at")
        .eq("user_id", user_id)
        .order("recorded_at", desc=False)
        .execute()
    )
    return result.data or []


def get_current_gpa(user_id: str) -> dict | None:
    """
    Returns the latest semester GPA record.
    """
    rows = get_semester_gpa(user_id)
    return rows[-1] if rows else None


def _calculate_cgpa_from_history(rows: list[dict]) -> float | None:
    """
    Calculates CGPA from all GPA history rows.
    Priority:
    1) Weighted by incremental credits derived from cumulative total_credits.
    2) Fallback to simple average if credits are unavailable.
    """
    valid_rows = []
    for row in rows:
        gpa = _to_float(row.get("gpa"))
        if gpa is None:
            continue
        total_credits = _to_int(row.get("total_credits"))
        valid_rows.append(
            {
                "gpa": gpa,
                "total_credits": total_credits,
            }
        )

    if not valid_rows:
        return None

    weighted_points = 0.0
    weighted_credits = 0
    previous_total = 0
    weighted_mode = True

    for row in valid_rows:
        total_credits = row["total_credits"]
        if total_credits is None:
            weighted_mode = False
            break

        delta = total_credits - previous_total
        if delta <= 0:
            weighted_mode = False
            break

        weighted_points += row["gpa"] * delta
        weighted_credits += delta
        previous_total = total_credits

    if weighted_mode and weighted_credits > 0:
        return round(weighted_points / weighted_credits, 3)

    avg = sum(row["gpa"] for row in valid_rows) / len(valid_rows)
    return round(avg, 3)


def get_cgpa(user_id: str) -> dict:
    """
    Computes CGPA using all historical semester GPA rows.
    Returns metadata that can be reused by tools/APIs.
    """
    rows = get_semester_gpa(user_id)
    calculated = _calculate_cgpa_from_history(rows)

    if calculated is not None:
        last_row = rows[-1] if rows else {}
        return {
            "cgpa": calculated,
            "total_credits": _to_int(last_row.get("total_credits")),
            "source": "gpa_history",
            "semesters_count": len(rows),
            "history": rows,
        }

    # Fallback to student_cgpa table if history is missing/incomplete
    supabase = get_supabase()
    fallback = (
        supabase.table("student_cgpa")
        .select("cgpa, total_credits")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    data = fallback.data or {}
    return {
        "cgpa": _to_float(data.get("cgpa")),
        "total_credits": _to_int(data.get("total_credits")),
        "source": "student_cgpa",
        "semesters_count": len(rows),
        "history": rows,
    }
