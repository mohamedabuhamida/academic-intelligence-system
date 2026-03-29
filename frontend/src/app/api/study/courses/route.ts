import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getCourseDetails<T>(courseRelation: T | T[] | null | undefined): T | null {
  if (!courseRelation) return null;
  return Array.isArray(courseRelation) ? courseRelation[0] ?? null : courseRelation;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: studentCourses, error } = await supabase
      .from("student_courses")
      .select(`
        semester_id,
        status,
        courses (
          id,
          code,
          name,
          credit_hours,
          difficulty_level
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "current")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const semesterId = studentCourses?.find((item) => item.semester_id)?.semester_id ?? null;

    let currentSemester = null;
    if (semesterId) {
      const { data: semester } = await supabase
        .from("semesters")
        .select("id, name, term, academic_year")
        .eq("id", semesterId)
        .maybeSingle();

      currentSemester = semester ?? null;
    }

    const courses = (studentCourses ?? [])
      .map((item) => {
        const details = getCourseDetails(item.courses);
        if (!details) return null;

        return {
          id: details.id,
          code: details.code,
          name: details.name,
          creditHours: details.credit_hours,
          difficultyLevel: details.difficulty_level,
          semesterId: item.semester_id,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      currentSemester,
      courses,
    });
  } catch (error) {
    console.error("Study courses API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
