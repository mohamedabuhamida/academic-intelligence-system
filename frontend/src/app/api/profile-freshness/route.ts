import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type AlertTone = "warning" | "info" | "success";

type SemesterRecord = {
  id: string;
  name: string | null;
  term: string | null;
  academic_year: string | null;
};

function termWeight(term: string | null | undefined) {
  if (term === "spring") return 1;
  if (term === "summer") return 2;
  if (term === "fall") return 3;
  return 0;
}

function yearWeight(academicYear: string | null | undefined) {
  const matches = (academicYear ?? "").match(/\d{4}/g) ?? [];
  if (matches.length === 0) return 0;
  return Math.max(...matches.map((value) => Number(value)));
}

function compareSemesters(a: SemesterRecord | null, b: SemesterRecord | null) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;

  const yearDiff = yearWeight(a.academic_year) - yearWeight(b.academic_year);
  if (yearDiff !== 0) return yearDiff;

  return termWeight(a.term) - termWeight(b.term);
}

function semesterLabel(semester: SemesterRecord | null) {
  if (!semester) return "your latest semester";
  return [semester.academic_year, semester.term, semester.name].filter(Boolean).join(" - ");
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
        .select("full_name, department, university_id, total_required_hours")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("student_courses")
        .select(`
          status,
          semester_id,
          courses (
            credit_hours
          )
        `)
        .eq("user_id", user.id),
      supabase
        .from("semesters")
        .select("id, name, term, academic_year"),
    ]);

    const profile = profileResult.data;
    const semesters = (semestersResult.data ?? []) as SemesterRecord[];
    const studentCourses = studentCoursesResult.data ?? [];

    const semesterMap = new Map(semesters.map((semester) => [semester.id, semester]));
    const latestSystemSemester =
      semesters.sort((a, b) => compareSemesters(b, a))[0] ?? null;

    const userSemesterIds = Array.from(
      new Set(
        studentCourses
          .map((item) => item.semester_id)
          .filter(Boolean),
      ),
    ) as string[];

    const latestUserSemester =
      userSemesterIds
        .map((semesterId) => semesterMap.get(semesterId) ?? null)
        .sort((a, b) => compareSemesters(b, a))[0] ?? null;

    const activeCourses = studentCourses.filter((item) => item.status === "current");
    const plannedCourses = studentCourses.filter((item) => item.status === "planned");
    const currentCredits = activeCourses.reduce((sum, item) => {
      const relation = Array.isArray(item.courses) ? item.courses[0] : item.courses;
      return sum + Number(relation?.credit_hours ?? 0);
    }, 0);

    const missingProfileFields = [
      !profile?.full_name ? "full name" : null,
      !profile?.department ? "department" : null,
      !profile?.university_id ? "university" : null,
      !profile?.total_required_hours ? "required hours" : null,
    ].filter(Boolean) as string[];

    const alerts: Array<{
      id: string;
      tone: AlertTone;
      title: string;
      message: string;
      ctaLabel: string;
      ctaHref: string;
    }> = [];

    if (missingProfileFields.length > 0) {
      alerts.push({
        id: "profile-missing-fields",
        tone: "warning",
        title: "Complete your academic profile",
        message: `Your profile is still missing ${missingProfileFields.join(", ")}. Updating it keeps planning and dashboard insights accurate.`,
        ctaLabel: "Update profile",
        ctaHref: "/dashboard/profile",
      });
    }

    if (studentCourses.length === 0) {
      alerts.push({
        id: "no-history",
        tone: "warning",
        title: "Add your academic history",
        message: "Your dashboard is active, but there are no semester records linked to your profile yet.",
        ctaLabel: "Add courses",
        ctaHref: "/dashboard/profile",
      });
    }

    if (
      latestSystemSemester &&
      latestUserSemester &&
      compareSemesters(latestSystemSemester, latestUserSemester) > 0
    ) {
      alerts.push({
        id: "new-semester-available",
        tone: "info",
        title: "A newer semester is available",
        message: `The latest semester in the system is ${semesterLabel(latestSystemSemester)}, but your latest academic record is ${semesterLabel(latestUserSemester)}.`,
        ctaLabel: "Refresh profile",
        ctaHref: "/dashboard/profile",
      });
    }

    if (studentCourses.length > 0 && activeCourses.length === 0) {
      alerts.push({
        id: "no-current-courses",
        tone: "info",
        title: "No current courses listed",
        message: "Add this term's current courses so Study Chat, planning, and progress tracking stay in sync.",
        ctaLabel: "Add current courses",
        ctaHref: "/dashboard/profile",
      });
    }

    if (currentCredits >= 18) {
      alerts.push({
        id: "heavy-load",
        tone: "warning",
        title: "Heavy current load detected",
        message: `You currently have ${currentCredits} credit hours marked as current. Consider reviewing your semester plan and study priorities.`,
        ctaLabel: "Review planner",
        ctaHref: "/dashboard/planner",
      });
    }

    if (activeCourses.length > 0 && plannedCourses.length === 0) {
      alerts.push({
        id: "no-planned-courses",
        tone: "success",
        title: "Good time to plan ahead",
        message: "Your current semester is recorded. Add a few planned courses for upcoming terms to improve recommendations.",
        ctaLabel: "Plan next term",
        ctaHref: "/dashboard/planner",
      });
    }

    return NextResponse.json({
      summary: {
        missingProfileFields,
        hasAcademicHistory: studentCourses.length > 0,
        activeCourses: activeCourses.length,
        currentCredits,
        latestUserSemester,
        latestSystemSemester,
      },
      alerts,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Profile freshness API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
