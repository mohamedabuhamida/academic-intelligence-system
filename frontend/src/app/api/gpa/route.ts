import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CourseRelation =
  | {
      credit_hours: number | null;
      name?: string | null;
      code?: string | null;
    }
  | Array<{
      credit_hours: number | null;
      name?: string | null;
      code?: string | null;
    }>
  | null
  | undefined;

function getCourseDetails(courseRelation: CourseRelation) {
  if (!courseRelation) return null;
  return Array.isArray(courseRelation) ? courseRelation[0] ?? null : courseRelation;
}

function getCreditHours(courseRelation: CourseRelation) {
  return Number(getCourseDetails(courseRelation)?.credit_hours ?? 0);
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

    const userId = user.id;

    const [profileResult, cgpaResult, coursesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, total_required_hours")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("student_cgpa")
        .select("cgpa, total_credits, updated_at")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("student_courses")
        .select(`
          status,
          grade,
          grade_points,
          courses (
            credit_hours,
            name,
            code
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    const profile = profileResult.data;
    const cgpaData = cgpaResult.data;
    const { data: courses, error: coursesError } = coursesResult;

    if (coursesError) {
      console.error("GPA courses error:", coursesError);
    }

    const completedCourses =
      courses?.filter(
        (course) =>
          course.status === "completed" &&
          course.grade_points !== null &&
          course.grade_points !== undefined &&
          getCreditHours(course.courses) > 0,
      ) ?? [];

    const completedCredits = (courses ?? [])
      .filter((course) => course.status === "completed")
      .reduce((sum, course) => sum + getCreditHours(course.courses), 0);

    let totalGradePoints = 0;
    let gradedCredits = 0;

    completedCourses.forEach((course) => {
      const creditHours = getCreditHours(course.courses);
      const gradePoints = Number(course.grade_points) || 0;
      totalGradePoints += gradePoints * creditHours;
      gradedCredits += creditHours;
    });

    const currentCgpa =
      cgpaData?.cgpa !== null && cgpaData?.cgpa !== undefined
        ? Number(cgpaData.cgpa)
        : gradedCredits > 0
          ? Number((totalGradePoints / gradedCredits).toFixed(3))
          : 0;

    const totalCredits =
      cgpaData?.total_credits !== null && cgpaData?.total_credits !== undefined
        ? Number(cgpaData.total_credits)
        : gradedCredits;

    const requiredCredits = Number(profile?.total_required_hours ?? 142);
    const remainingCredits = Math.max(0, requiredCredits - completedCredits);

    const recentCompletedCourses = completedCourses.slice(0, 8).map((course) => {
      const details = getCourseDetails(course.courses);
      return {
        name: details?.name ?? "Unnamed course",
        code: details?.code ?? "N/A",
        creditHours: getCreditHours(course.courses),
        grade: course.grade ?? "N/A",
        gradePoints: Number(course.grade_points ?? 0),
      };
    });

    return NextResponse.json({
      user: {
        name: profile?.full_name ?? "Student",
      },
      academic: {
        currentCgpa,
        completedCredits,
        gradedCredits: totalCredits,
        requiredCredits,
        remainingCredits,
        completedCourseCount: completedCourses.length,
        lastUpdated: cgpaData?.updated_at ?? null,
      },
      recentCompletedCourses,
      gradeScale: [
        { label: "A+", points: 4 },
        { label: "A", points: 4 },
        { label: "A-", points: 3.7 },
        { label: "B+", points: 3.3 },
        { label: "B", points: 3 },
        { label: "B-", points: 2.7 },
        { label: "C+", points: 2.3 },
        { label: "C", points: 2 },
        { label: "C-", points: 1.7 },
        { label: "D+", points: 1.3 },
        { label: "D", points: 1 },
        { label: "F", points: 0 },
      ],
    });
  } catch (error) {
    console.error("GPA API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
