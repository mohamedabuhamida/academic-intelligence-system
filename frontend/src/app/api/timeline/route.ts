import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CourseRelation =
  | {
      code?: string | null;
      name?: string | null;
      credit_hours: number | null;
    }
  | Array<{
      code?: string | null;
      name?: string | null;
      credit_hours: number | null;
    }>
  | null
  | undefined;

function getCourseDetails(courseRelation: CourseRelation) {
  if (!courseRelation) return null;
  return Array.isArray(courseRelation) ? courseRelation[0] ?? null : courseRelation;
}

function getTermOrder(term: string | null | undefined) {
  switch (term) {
    case "fall":
      return 1;
    case "spring":
      return 2;
    case "summer":
      return 3;
    default:
      return 4;
  }
}

function getAcademicYearStart(academicYear: string | null | undefined) {
  if (!academicYear) return 0;
  const match = academicYear.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function isTrackedStatus(
  status: string | null,
): status is "completed" | "current" | "planned" | "failed" {
  return status === "completed" || status === "current" || status === "planned" || status === "failed";
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

    const [profileResult, studentCoursesResult, semestersResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, total_required_hours")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("student_courses")
        .select(`
          semester_id,
          status,
          grade,
          grade_points,
          courses (
            code,
            name,
            credit_hours
          )
        `)
        .eq("user_id", user.id),
      supabase
        .from("semesters")
        .select("id, name, term, academic_year"),
    ]);

    const studentCourses = studentCoursesResult.data ?? [];
    const semesters = semestersResult.data ?? [];
    const totalRequiredHours = Number(profileResult.data?.total_required_hours ?? 142);

    const semesterMap = new Map(
      semesters.map((semester) => [
        semester.id,
        {
          id: semester.id,
          name: semester.name ?? "Unnamed Semester",
          term: semester.term ?? null,
          academicYear: semester.academic_year ?? null,
          totalCredits: 0,
          completedCredits: 0,
          semesterGpa: null as number | null,
          cumulativeGpa: null as number | null,
          qualityPoints: 0,
          gpaCredits: 0,
          statusCounts: {
            completed: 0,
            current: 0,
            planned: 0,
            failed: 0,
          },
          courses: [] as Array<{
            code: string;
            name: string;
            creditHours: number;
            status: string | null;
            grade: string | null;
          }>,
        },
      ]),
    );

    studentCourses.forEach((studentCourse) => {
      if (!studentCourse.semester_id) {
        return;
      }

      const details = getCourseDetails(studentCourse.courses);
      const creditHours = Number(details?.credit_hours ?? 0);
      const semesterEntry = semesterMap.get(studentCourse.semester_id);

      if (!semesterEntry) {
        return;
      }

      semesterEntry.totalCredits += creditHours;
      if (studentCourse.status === "completed") {
        semesterEntry.completedCredits += creditHours;
      }
      if (
        studentCourse.status === "completed" &&
        studentCourse.grade_points !== null &&
        studentCourse.grade_points !== undefined &&
        creditHours > 0
      ) {
        semesterEntry.qualityPoints += Number(studentCourse.grade_points) * creditHours;
        semesterEntry.gpaCredits += creditHours;
      }

      if (isTrackedStatus(studentCourse.status)) {
        semesterEntry.statusCounts[studentCourse.status] += 1;
      }

      semesterEntry.courses.push({
        code: details?.code ?? "N/A",
        name: details?.name ?? "Unnamed course",
        creditHours,
        status: studentCourse.status,
        grade: studentCourse.grade,
      });
    });

    const timeline = Array.from(semesterMap.values())
      .filter((semester) => semester.courses.length > 0)
      .map((semester) => ({
        ...semester,
        semesterGpa:
          semester.gpaCredits > 0
            ? Number((semester.qualityPoints / semester.gpaCredits).toFixed(3))
            : null,
      }))
      .sort((a, b) => {
        const yearA = getAcademicYearStart(a.academicYear);
        const yearB = getAcademicYearStart(b.academicYear);
        if (yearA !== yearB) return yearA - yearB;
        return getTermOrder(a.term) - getTermOrder(b.term);
      });

    let runningQualityPoints = 0;
    let runningCredits = 0;

    const timelineWithCumulative = timeline.map((semester) => {
      runningQualityPoints += semester.qualityPoints;
      runningCredits += semester.gpaCredits;

      return {
        ...semester,
        cumulativeGpa:
          runningCredits > 0
            ? Number((runningQualityPoints / runningCredits).toFixed(3))
            : null,
      };
    });

    const completedCreditsOverall = timelineWithCumulative.reduce(
      (sum, semester) => sum + semester.completedCredits,
      0,
    );

    return NextResponse.json({
      user: {
        name: profileResult.data?.full_name ?? "Student",
      },
      summary: {
        totalRequiredHours,
        completedCredits: completedCreditsOverall,
        remainingCredits: Math.max(0, totalRequiredHours - completedCreditsOverall),
        progress:
          totalRequiredHours > 0
            ? Math.min(Math.round((completedCreditsOverall / totalRequiredHours) * 100), 100)
            : 0,
        semesterCount: timelineWithCumulative.length,
      },
      timeline: timelineWithCumulative,
    });
  } catch (error) {
    console.error("Timeline API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
