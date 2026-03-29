import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type OnboardingCourseInput = {
  semesterId: string;
  courseId: string;
  status: "completed" | "failed" | "current" | "planned";
  grade: string | null;
  gradePoints: number | null;
};

const gradePointsMap: Record<string, number> = {
  "A+": 4,
  A: 4,
  "A-": 3.7,
  "B+": 3.3,
  B: 3,
  "B-": 2.7,
  "C+": 2.3,
  C: 2,
  "C-": 1.7,
  "D+": 1.3,
  D: 1,
  F: 0,
};

function buildHistoryKey(semesterId: string, courseId: string) {
  return `${semesterId}::${courseId}`;
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

    const [profileResult, universitiesResult, semestersResult, coursesResult, studentCoursesResult] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, department, university_id, total_required_hours")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("universities").select("id, name").order("name", { ascending: true }),
        supabase
          .from("semesters")
          .select("id, name, term, academic_year")
          .order("academic_year", { ascending: true }),
        supabase
          .from("courses")
          .select("id, code, name, credit_hours, level")
          .order("code", { ascending: true }),
        supabase
          .from("student_courses")
          .select("id, semester_id, course_id, status, grade, grade_points")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
      ]);

    return NextResponse.json({
      profile: profileResult.data,
      universities: universitiesResult.data ?? [],
      semesters: semestersResult.data ?? [],
      courses: coursesResult.data ?? [],
      studentCourses: studentCoursesResult.data ?? [],
      gradeScale: Object.entries(gradePointsMap).map(([grade, points]) => ({
        grade,
        points,
      })),
    });
  } catch (error) {
    console.error("Onboarding GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      fullName?: string;
      department?: string;
      universityId?: string | null;
      totalRequiredHours?: number;
      academicHistory?: OnboardingCourseInput[];
    };

    const fullName = body.fullName?.trim() ?? "";
    const department = body.department?.trim() ?? "";
    const universityId = body.universityId ?? null;
    const totalRequiredHours = Number(body.totalRequiredHours ?? 0);
    const academicHistory = body.academicHistory ?? [];

    if (!fullName || !department || !totalRequiredHours || academicHistory.length === 0) {
      return NextResponse.json(
        { error: "Please complete your profile details and add your academic history." },
        { status: 400 },
      );
    }

    const normalizedKeys = academicHistory.map((item) =>
      buildHistoryKey(item.semesterId, item.courseId),
    );

    if (new Set(normalizedKeys).size !== normalizedKeys.length) {
      return NextResponse.json(
        { error: "Duplicate course detected in the same semester. Keep only one row per course per semester." },
        { status: 400 },
      );
    }

    const normalizedHistory = academicHistory.map((item) => {
      const normalizedGrade =
        item.status === "completed" || item.status === "failed"
          ? item.grade?.trim() || null
          : null;

      return {
        user_id: user.id,
        semester_id: item.semesterId,
        course_id: item.courseId,
        status: item.status,
        grade: normalizedGrade,
        grade_points:
          normalizedGrade !== null
            ? Number(item.gradePoints ?? gradePointsMap[normalizedGrade] ?? 0)
            : null,
      };
    });

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: fullName,
        department,
        university_id: universityId,
        total_required_hours: totalRequiredHours,
        role: "student",
      },
      { onConflict: "id" },
    );

    if (profileError) {
      throw profileError;
    }

    const { error: deleteError } = await supabase
      .from("student_courses")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    const { error: insertError } = await supabase
      .from("student_courses")
      .insert(normalizedHistory);

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding POST error:", error);
    return NextResponse.json(
      { error: "Unable to save onboarding data." },
      { status: 500 },
    );
  }
}
