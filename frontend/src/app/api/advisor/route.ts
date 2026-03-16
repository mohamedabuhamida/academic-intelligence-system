import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CourseRelation =
  | {
      credit_hours: number | null;
      name?: string | null;
      code?: string | null;
      difficulty_level?: number | null;
      level?: number | null;
    }
  | Array<{
      credit_hours: number | null;
      name?: string | null;
      code?: string | null;
      difficulty_level?: number | null;
      level?: number | null;
    }>
  | null
  | undefined;

type RiskCourseRelation =
  | {
      name?: string | null;
      code?: string | null;
    }
  | Array<{
      name?: string | null;
      code?: string | null;
    }>
  | null
  | undefined;

type AdvisorInsight = {
  id: string;
  tone: "success" | "warning" | "info";
  title: string;
  message: string;
};

function getCourseDetails(courseRelation: CourseRelation) {
  if (!courseRelation) return null;
  return Array.isArray(courseRelation) ? courseRelation[0] ?? null : courseRelation;
}

function getRiskCourseDetails(courseRelation: RiskCourseRelation) {
  if (!courseRelation) return null;
  return Array.isArray(courseRelation) ? courseRelation[0] ?? null : courseRelation;
}

function getCreditHours(courseRelation: CourseRelation) {
  return Number(getCourseDetails(courseRelation)?.credit_hours ?? 0);
}

function formatCourseLabel(courseRelation: CourseRelation | RiskCourseRelation) {
  const course = Array.isArray(courseRelation)
    ? courseRelation[0] ?? null
    : courseRelation;

  if (!course) return "this course";
  return course.code ? `${course.code}${course.name ? ` (${course.name})` : ""}` : course.name || "this course";
}

function getMaxAllowedCredits(cgpa: number) {
  if (cgpa < 2) return 12;
  if (cgpa < 3) return 18;
  return 21;
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

    const [
      profileResult,
      cgpaResult,
      coursesResult,
      riskResult,
      latestPlanResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, total_required_hours")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("student_cgpa")
        .select("cgpa, total_credits")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("student_courses")
        .select(`
          status,
          grade_points,
          courses (
            credit_hours,
            name,
            code,
            difficulty_level,
            level
          )
        `)
        .eq("user_id", userId),
      supabase
        .from("risk_analysis")
        .select(`
          risk_score,
          risk_level,
          confidence,
          courses (
            name,
            code
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("semester_plans")
        .select("semester_name, total_credits, predicted_gpa, overall_risk, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const profile = profileResult.data;
    const cgpaData = cgpaResult.data;
    const courses = coursesResult.data ?? [];
    const riskItems = riskResult.data ?? [];
    const latestPlan = latestPlanResult.data;

    const completedCourses = courses.filter((course) => course.status === "completed");
    const activeCourses = courses.filter((course) => course.status === "current");
    const plannedCourses = courses.filter((course) => course.status === "planned");
    const allUpcomingCourses = [...activeCourses, ...plannedCourses];

    const completedCredits = completedCourses.reduce(
      (sum, course) => sum + getCreditHours(course.courses),
      0,
    );
    const activeCredits = activeCourses.reduce(
      (sum, course) => sum + getCreditHours(course.courses),
      0,
    );
    const plannedCredits = plannedCourses.reduce(
      (sum, course) => sum + getCreditHours(course.courses),
      0,
    );
    const upcomingCredits = activeCredits + plannedCredits;

    let cgpa = Number(cgpaData?.cgpa ?? 0);
    if (!cgpa && completedCourses.length > 0) {
      let totalPoints = 0;
      let totalCredits = 0;

      completedCourses.forEach((course) => {
        const credits = getCreditHours(course.courses);
        const gradePoints = Number(course.grade_points ?? 0);
        if (credits > 0 && gradePoints > 0) {
          totalPoints += credits * gradePoints;
          totalCredits += credits;
        }
      });

      if (totalCredits > 0) {
        cgpa = Number((totalPoints / totalCredits).toFixed(3));
      }
    }

    const requiredCredits = Number(profile?.total_required_hours ?? 142);
    const remainingCredits = Math.max(0, requiredCredits - completedCredits);
    const progress = requiredCredits > 0
      ? Math.min(Math.round((completedCredits / requiredCredits) * 100), 100)
      : 0;

    const insights: AdvisorInsight[] = [];
    const firstName = profile?.full_name?.split(" ")[0] || "Student";

    if (cgpa >= 3.5) {
      insights.push({
        id: "performance-strong",
        tone: "success",
        title: "Strong academic standing",
        message: `${firstName}, your current CGPA is ${cgpa.toFixed(3)}. You are in a strong position to take on strategic electives and protect your momentum.`,
      });
    } else if (cgpa > 0 && cgpa < 2) {
      insights.push({
        id: "performance-warning",
        tone: "warning",
        title: "Academic warning risk",
        message: `Your current CGPA is ${cgpa.toFixed(3)}, which suggests a recovery semester is the safest next move. Focus on a lighter load and avoid stacking difficult courses together.`,
      });
    } else {
      insights.push({
        id: "performance-steady",
        tone: "info",
        title: "Stable performance trend",
        message: `Your current CGPA is ${cgpa.toFixed(3)}. A balanced semester with carefully chosen courses can still improve your cumulative result without taking unnecessary risk.`,
      });
    }

    const maxAllowedCredits = getMaxAllowedCredits(cgpa);
    if (upcomingCredits > 0) {
      const hardUpcomingCourses = allUpcomingCourses.filter((course) => {
        const difficulty = Number(getCourseDetails(course.courses)?.difficulty_level ?? 0);
        return difficulty >= 4;
      });

      if (upcomingCredits > maxAllowedCredits) {
        insights.push({
          id: "load-over-limit",
          tone: "warning",
          title: "Upcoming load looks too heavy",
          message: `You currently have ${upcomingCredits} upcoming credits across active and planned courses, while your CGPA band suggests a safer maximum of ${maxAllowedCredits} credits.`,
        });
      } else if (hardUpcomingCourses.length >= 2) {
        const highlightedCourses = hardUpcomingCourses
          .slice(0, 2)
          .map((course) => formatCourseLabel(course.courses))
          .join(" and ");

        insights.push({
          id: "load-difficulty",
          tone: "warning",
          title: "Watch course difficulty balance",
          message: `Your upcoming schedule includes multiple high-difficulty courses such as ${highlightedCourses}. Pairing them in one term may increase workload pressure even if the credit count is allowed.`,
        });
      } else {
        insights.push({
          id: "load-manageable",
          tone: "success",
          title: "Upcoming load looks manageable",
          message: `Your current and planned registration totals ${upcomingCredits} credits, which fits within the typical limit for your current CGPA band.`,
        });
      }
    } else {
      insights.push({
        id: "load-empty",
        tone: "info",
        title: "No semester load selected yet",
        message: "You do not have active or planned courses in the system yet. The next best step is to build a semester plan so the advisor can evaluate workload and graduation pace.",
      });
    }

    if (remainingCredits === 0) {
      insights.push({
        id: "graduation-ready",
        tone: "success",
        title: "Graduation requirement complete",
        message: `You have completed ${completedCredits} of ${requiredCredits} required credits. Your record appears academically ready for graduation review.`,
      });
    } else {
      const estimatedSemesters = Math.ceil(remainingCredits / 15);
      insights.push({
        id: "graduation-progress",
        tone: progress >= 75 ? "success" : "info",
        title: "Graduation progress snapshot",
        message: `You have completed ${completedCredits} of ${requiredCredits} required credits (${progress}%). At a steady pace of 15 credits per semester, you are roughly ${estimatedSemesters} semester(s) away from completion.`,
      });
    }

    const highestRisk = riskItems.find((item) => {
      const level = String(item.risk_level ?? "").toLowerCase();
      return level === "high" || level === "critical";
    });

    if (highestRisk) {
      insights.push({
        id: "risk-analysis",
        tone: "warning",
        title: "Recorded risk signal",
        message: `${formatCourseLabel(getRiskCourseDetails(highestRisk.courses))} has a recorded ${String(highestRisk.risk_level ?? "elevated")} risk profile in your recent analysis data.`,
      });
    } else if (latestPlan?.overall_risk !== null && latestPlan?.overall_risk !== undefined) {
      const riskValue = Number(latestPlan.overall_risk);
      const riskTone = riskValue >= 70 ? "warning" : "info";
      insights.push({
        id: "latest-plan-risk",
        tone: riskTone,
        title: "Latest semester plan review",
        message: `Your latest saved plan${latestPlan.semester_name ? ` for ${latestPlan.semester_name}` : ""} has an overall risk score of ${riskValue}. ${riskValue >= 70 ? "Consider reducing workload intensity before locking that plan." : "The plan looks reasonably balanced so far."}`,
      });
    }

    return NextResponse.json({
      user: {
        name: profile?.full_name ?? "Student",
      },
      academic: {
        cgpa,
        completedCredits,
        requiredCredits,
        remainingCredits,
        progress,
        activeCredits,
        plannedCredits,
        maxAllowedCredits,
      },
      insights: insights.slice(0, 4),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Advisor API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
