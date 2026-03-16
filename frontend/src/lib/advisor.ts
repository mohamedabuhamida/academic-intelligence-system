export type AdvisorInsight = {
  id: string;
  tone: "success" | "warning" | "info";
  title: string;
  message: string;
};

export type AdvisorCourse = {
  credit_hours: number | null;
  name?: string | null;
  code?: string | null;
  difficulty_level?: number | null;
  level?: number | null;
};

export type AdvisorRiskCourse = {
  name?: string | null;
  code?: string | null;
};

export type AdvisorStudentCourse = {
  status: string | null;
  grade_points: number | null;
  courses: AdvisorCourse | AdvisorCourse[] | null;
};

export type AdvisorRiskItem = {
  risk_score?: number | null;
  risk_level?: string | null;
  confidence?: number | null;
  courses?: AdvisorRiskCourse | AdvisorRiskCourse[] | null;
};

export type AdvisorLatestPlan = {
  semester_name?: string | null;
  total_credits?: number | null;
  predicted_gpa?: number | null;
  overall_risk?: number | null;
  created_at?: string | null;
} | null;

export type BuildAdvisorInsightsParams = {
  fullName?: string | null;
  cgpa?: number | null;
  totalRequiredHours?: number | null;
  studentCourses: AdvisorStudentCourse[];
  riskItems: AdvisorRiskItem[];
  latestPlan: AdvisorLatestPlan;
};

function getCourseDetails(courseRelation: AdvisorCourse | AdvisorCourse[] | null | undefined) {
  if (!courseRelation) return null;
  return Array.isArray(courseRelation) ? courseRelation[0] ?? null : courseRelation;
}

function getRiskCourseDetails(
  courseRelation: AdvisorRiskCourse | AdvisorRiskCourse[] | null | undefined,
) {
  if (!courseRelation) return null;
  return Array.isArray(courseRelation) ? courseRelation[0] ?? null : courseRelation;
}

function getCreditHours(courseRelation: AdvisorCourse | AdvisorCourse[] | null | undefined) {
  return Number(getCourseDetails(courseRelation)?.credit_hours ?? 0);
}

function formatCourseLabel(
  courseRelation:
    | AdvisorCourse
    | AdvisorCourse[]
    | AdvisorRiskCourse
    | AdvisorRiskCourse[]
    | null
    | undefined,
) {
  const course = Array.isArray(courseRelation)
    ? courseRelation[0] ?? null
    : courseRelation;

  if (!course) return "this course";
  return course.code
    ? `${course.code}${course.name ? ` (${course.name})` : ""}`
    : course.name || "this course";
}

export function getMaxAllowedCredits(cgpa: number) {
  if (cgpa < 2) return 12;
  if (cgpa < 3) return 18;
  return 21;
}

export function computeCgpaFromCompletedCourses(studentCourses: AdvisorStudentCourse[]) {
  const completedCourses = studentCourses.filter((course) => course.status === "completed");
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

  if (totalCredits <= 0) return 0;
  return Number((totalPoints / totalCredits).toFixed(3));
}

export function buildAdvisorInsights({
  fullName,
  cgpa,
  totalRequiredHours,
  studentCourses,
  riskItems,
  latestPlan,
}: BuildAdvisorInsightsParams) {
  const completedCourses = studentCourses.filter((course) => course.status === "completed");
  const activeCourses = studentCourses.filter((course) => course.status === "current");
  const plannedCourses = studentCourses.filter((course) => course.status === "planned");
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

  const resolvedCgpa =
    cgpa && Number(cgpa) > 0 ? Number(cgpa) : computeCgpaFromCompletedCourses(studentCourses);
  const requiredCredits = Number(totalRequiredHours ?? 142);
  const remainingCredits = Math.max(0, requiredCredits - completedCredits);
  const progress =
    requiredCredits > 0
      ? Math.min(Math.round((completedCredits / requiredCredits) * 100), 100)
      : 0;

  const insights: AdvisorInsight[] = [];
  const firstName = fullName?.split(" ")[0] || "Student";

  if (resolvedCgpa >= 3.5) {
    insights.push({
      id: "performance-strong",
      tone: "success",
      title: "Strong academic standing",
      message: `${firstName}, your current CGPA is ${resolvedCgpa.toFixed(3)}. You are in a strong position to take on strategic electives and protect your momentum.`,
    });
  } else if (resolvedCgpa > 0 && resolvedCgpa < 2) {
    insights.push({
      id: "performance-warning",
      tone: "warning",
      title: "Academic warning risk",
      message: `Your current CGPA is ${resolvedCgpa.toFixed(3)}, which suggests a recovery semester is the safest next move. Focus on a lighter load and avoid stacking difficult courses together.`,
    });
  } else {
    insights.push({
      id: "performance-steady",
      tone: "info",
      title: "Stable performance trend",
      message: `Your current CGPA is ${resolvedCgpa.toFixed(3)}. A balanced semester with carefully chosen courses can still improve your cumulative result without taking unnecessary risk.`,
    });
  }

  const maxAllowedCredits = getMaxAllowedCredits(resolvedCgpa);
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
    insights.push({
      id: "latest-plan-risk",
      tone: riskValue >= 70 ? "warning" : "info",
      title: "Latest semester plan review",
      message: `Your latest saved plan${latestPlan.semester_name ? ` for ${latestPlan.semester_name}` : ""} has an overall risk score of ${riskValue}. ${riskValue >= 70 ? "Consider reducing workload intensity before locking that plan." : "The plan looks reasonably balanced so far."}`,
    });
  }

  return {
    academic: {
      cgpa: resolvedCgpa,
      completedCredits,
      requiredCredits,
      remainingCredits,
      progress,
      activeCredits,
      plannedCredits,
      maxAllowedCredits,
    },
    insights: insights.slice(0, 4),
  };
}
