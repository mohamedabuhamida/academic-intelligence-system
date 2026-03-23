import { createClient } from "@/lib/supabase/server";

export type CourseRow = {
  id: string;
  code: string | null;
  name: string;
  credit_hours: number;
  difficulty_level: number | null;
  level: number | null;
};

export type StudentCourseRow = {
  course_id: string | null;
  status: string | null;
  grade: string | null;
  grade_points: number | null;
  courses:
    | { credit_hours: number | null }
    | Array<{ credit_hours: number | null }>
    | null;
};

export type PrereqRow = {
  course_id: string | null;
  prerequisite_id: string | null;
};

export type EligibleCourse = {
  id: string;
  code: string;
  name: string;
  credit_hours: number;
  level: number | null;
  difficulty_level: number | null;
  missing_prerequisites: string[];
  can_register: boolean;
};

export type NotEligibleCourse = {
  id: string;
  code: string;
  name: string;
  credit_hours: number;
  level: number | null;
  difficulty_level: number | null;
  reason: "missing_prerequisites" | "insufficient_completed_credits";
  missing_prerequisites: string[];
  required_credits?: number;
  current_completed_credits?: number;
};

function getCreditHours(
  courseRelation:
    | { credit_hours: number | null }
    | Array<{ credit_hours: number | null }>
    | null
): number {
  const course = Array.isArray(courseRelation) ? courseRelation[0] : courseRelation;
  return Number(course?.credit_hours ?? 0);
}

const MIN_CREDITS_BY_LEVEL: Record<number, number> = {
  1: 0,
  2: 36,
  3: 72,
  4: 108,
};

export async function buildPlannerEligibility(userId: string) {
  const supabase = await createClient();

  const [coursesRes, studentCoursesRes, prereqRes] = await Promise.all([
    supabase
      .from("courses")
      .select("id, code, name, credit_hours, difficulty_level, level")
      .order("level", { ascending: true })
      .order("code", { ascending: true }),
    supabase
      .from("student_courses")
      .select("course_id, status, grade, grade_points, courses(credit_hours)")
      .eq("user_id", userId),
    supabase
      .from("course_prerequisites")
      .select("course_id, prerequisite_id"),
  ]);

  if (coursesRes.error) throw new Error(coursesRes.error.message);
  if (studentCoursesRes.error) throw new Error(studentCoursesRes.error.message);
  if (prereqRes.error) throw new Error(prereqRes.error.message);

  const courses = (coursesRes.data || []) as CourseRow[];
  const studentCourses = (studentCoursesRes.data || []) as StudentCourseRow[];
  const prereqs = (prereqRes.data || []) as PrereqRow[];

  const courseMap = new Map<string, CourseRow>();
  courses.forEach((c) => courseMap.set(c.id, c));

  const passedCourseIds = new Set<string>();
  const blockedStatuses = new Set(["completed", "current", "planned"]);
  const alreadyRegisteredIds = new Set<string>();

  let completedCredits = 0;
  let totalPoints = 0;
  let totalCreditsForCgpa = 0;

  for (const row of studentCourses) {
    const cid = row.course_id;
    if (!cid) continue;

    if (row.status && blockedStatuses.has(row.status)) {
      alreadyRegisteredIds.add(cid);
    }

    const grade = (row.grade || "").toUpperCase();
    const isPassed =
      row.status === "completed" &&
      grade !== "F" &&
      grade !== "FF" &&
      grade !== "W" &&
      grade !== "NULL";

    if (isPassed) {
      passedCourseIds.add(cid);
      const credits = getCreditHours(row.courses ?? null);
      completedCredits += credits;
      if (row.grade_points != null && credits > 0) {
        totalPoints += Number(row.grade_points) * credits;
        totalCreditsForCgpa += credits;
      }
    }
  }

  const currentCgpa =
    totalCreditsForCgpa > 0
      ? Number((totalPoints / totalCreditsForCgpa).toFixed(3))
      : 0;

  const prereqMap = new Map<string, string[]>();
  for (const row of prereqs) {
    if (!row.course_id || !row.prerequisite_id) continue;
    const list = prereqMap.get(row.course_id) || [];
    list.push(row.prerequisite_id);
    prereqMap.set(row.course_id, list);
  }

  const eligible: EligibleCourse[] = [];
  const notEligible: NotEligibleCourse[] = [];

  for (const course of courses) {
    if (alreadyRegisteredIds.has(course.id)) continue;

    const code = course.code || course.name;

    const requiredCredits = MIN_CREDITS_BY_LEVEL[course.level || 1] ?? 0;
    if (completedCredits < requiredCredits) {
      notEligible.push({
        id: course.id,
        code,
        name: course.name,
        credit_hours: course.credit_hours,
        level: course.level,
        difficulty_level: course.difficulty_level,
        reason: "insufficient_completed_credits",
        missing_prerequisites: [],
        required_credits: requiredCredits,
        current_completed_credits: completedCredits,
      });
      continue;
    }

    const reqIds = prereqMap.get(course.id) || [];
    const missingIds = reqIds.filter((id) => !passedCourseIds.has(id));
    const missingCodes = missingIds
      .map((id) => courseMap.get(id)?.code || courseMap.get(id)?.name || id)
      .filter(Boolean) as string[];

    if (missingCodes.length === 0) {
      eligible.push({
        id: course.id,
        code,
        name: course.name,
        credit_hours: course.credit_hours,
        level: course.level,
        difficulty_level: course.difficulty_level,
        missing_prerequisites: [],
        can_register: true,
      });
    } else {
      notEligible.push({
        id: course.id,
        code,
        name: course.name,
        credit_hours: course.credit_hours,
        level: course.level,
        difficulty_level: course.difficulty_level,
        reason: "missing_prerequisites",
        missing_prerequisites: missingCodes,
      });
    }
  }

  return {
    eligible,
    notEligible,
    completedCredits,
    currentCgpa,
    stats: {
      eligible_count: eligible.length,
      not_eligible_count: notEligible.length,
      passed_count: passedCourseIds.size,
    },
  };
}

