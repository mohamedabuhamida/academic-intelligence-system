// app/api/dashboard/route.ts
import { NextResponse } from "next/server";

import { defaultLocale, isSupportedLocale } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";

function localizeTerm(term: string | null | undefined, locale: "en" | "ar") {
  if (term === "fall") return locale === "ar" ? "خريف" : "Fall";
  if (term === "spring") return locale === "ar" ? "ربيع" : "Spring";
  if (term === "summer") return locale === "ar" ? "صيف" : "Summer";
  return locale === "ar" ? "الفصل الحالي" : "Current semester";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const localeParam = searchParams.get("locale");
    const locale = isSupportedLocale(localeParam) ? localeParam : defaultLocale;

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
          grade_points,
          semester_id,
          courses (
            credit_hours,
            name,
            code,
            difficulty_level
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    const profile = profileResult.data;
    const cgpaData = cgpaResult.data;
    const { data: courses, error: coursesError } = coursesResult;

    if (coursesError) {
      console.error("Courses error:", coursesError);
    }

    const getCourseDetails = (
      courseRelation:
        | {
            credit_hours: number | null;
            name?: string | null;
            code?: string | null;
            difficulty_level?: number | null;
          }
        | Array<{
            credit_hours: number | null;
            name?: string | null;
            code?: string | null;
            difficulty_level?: number | null;
          }>
        | null
        | undefined,
    ) => {
      if (!courseRelation) return null;
      return Array.isArray(courseRelation) ? courseRelation[0] ?? null : courseRelation;
    };

    const getCreditHours = (
      courseRelation:
        | { credit_hours: number | null }
        | Array<{ credit_hours: number | null }>
        | null
        | undefined,
    ): number => {
      const course = getCourseDetails(courseRelation);
      return Number(course?.credit_hours ?? 0);
    };

    const activeCourses = courses?.filter((course) => course.status === "current").length || 0;

    const completedCredits =
      courses
        ?.filter((course) => course.status === "completed")
        .reduce((sum, course) => sum + getCreditHours(course.courses), 0) || 0;

    const completedWithGrades =
      courses?.filter(
        (course) =>
          course.status === "completed" && course.grade_points && getCreditHours(course.courses) > 0,
      ) || [];

    let cgpa = 0;
    let totalPoints = 0;
    let totalCreditsFromCourses = 0;

    if (cgpaData?.cgpa) {
      cgpa = Number(cgpaData.cgpa);
      totalCreditsFromCourses = cgpaData.total_credits || 0;
    } else {
      completedWithGrades.forEach((course) => {
        const credits = getCreditHours(course.courses);
        const gradePoints = Number(course.grade_points) || 0;
        totalPoints += gradePoints * credits;
        totalCreditsFromCourses += credits;
      });

      if (totalCreditsFromCourses > 0) {
        cgpa = Number((totalPoints / totalCreditsFromCourses).toFixed(3));
      }
    }

    const requiredCredits = profile?.total_required_hours ?? 142;
    const progress =
      requiredCredits > 0
        ? Math.min(Math.round((completedCredits / requiredCredits) * 100), 100)
        : 0;

    let currentSemester: { name?: string | null; term?: string | null; academic_year?: string | null } | null = null;
    if (activeCourses > 0 && courses) {
      const currentSemesterId = courses.find((course) => course.status === "current")?.semester_id;
      if (currentSemesterId) {
        const { data: semester } = await supabase
          .from("semesters")
          .select("name, term, academic_year")
          .eq("id", currentSemesterId)
          .single();
        currentSemester = semester;
      }
    }

    const courseDistribution = {
      easy: completedWithGrades.filter((course) => {
        const difficultyLevel = getCourseDetails(course.courses)?.difficulty_level;
        return difficultyLevel !== null && difficultyLevel !== undefined && difficultyLevel <= 2;
      }).length,
      medium: completedWithGrades.filter(
        (course) => getCourseDetails(course.courses)?.difficulty_level === 3,
      ).length,
      hard: completedWithGrades.filter((course) => {
        const difficultyLevel = getCourseDetails(course.courses)?.difficulty_level;
        return difficultyLevel !== null && difficultyLevel !== undefined && difficultyLevel >= 4;
      }).length,
    };

    const currentLabel = locale === "ar" ? "الحالي" : "Current";
    const currentSemesterLabel = locale === "ar" ? "الفصل الحالي" : "Current semester";
    const creditsLabel = locale === "ar" ? "ساعة" : "credits";
    const coursesLabel = locale === "ar" ? "مقررات" : "courses";

    const recentActivity = [
      {
        action: locale === "ar" ? "المعدل التراكمي" : "Cumulative GPA",
        detail: cgpa.toFixed(3),
        time: cgpaData?.updated_at
          ? new Date(cgpaData.updated_at).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")
          : currentLabel,
        icon: "graduation",
      },
      {
        action: locale === "ar" ? "إنجاز الساعات" : "Credit Completion",
        detail:
          locale === "ar"
            ? `${completedCredits} من ${requiredCredits} ${creditsLabel}`
            : `${completedCredits} of ${requiredCredits} ${creditsLabel}`,
        time: locale === "ar" ? `%${progress} مكتمل` : `${progress}% complete`,
        icon: "credits",
      },
      {
        action: locale === "ar" ? "المقررات المكتملة" : "Courses Completed",
        detail: `${completedWithGrades.length} ${coursesLabel}`,
        time:
          locale === "ar"
            ? `${courseDistribution.easy + courseDistribution.medium + courseDistribution.hard} إجمالي`
            : `${courseDistribution.easy + courseDistribution.medium + courseDistribution.hard} total`,
        icon: "courses",
      },
    ];

    if (activeCourses > 0) {
      recentActivity.unshift({
        action: locale === "ar" ? "المسجل حاليًا" : "Currently Enrolled",
        detail: locale === "ar" ? `${activeCourses} مقررات حالية` : `${activeCourses} active courses`,
        time: currentSemester
          ? `${localizeTerm(currentSemester.term, locale)} ${currentSemester.academic_year ?? ""}`.trim()
          : currentSemesterLabel,
        icon: "active",
      });
    }

    const creditsPerSemester = 15;
    const remainingCredits = Math.max(0, requiredCredits - completedCredits);
    const estimatedSemestersRemaining = Math.ceil(remainingCredits / creditsPerSemester);
    const estimatedGraduation =
      estimatedSemestersRemaining > 0
        ? locale === "ar"
          ? `${estimatedSemestersRemaining} فصول دراسية`
          : `${estimatedSemestersRemaining} semesters`
        : locale === "ar"
          ? "مؤهل للتخرج"
          : "Eligible for graduation";

    return NextResponse.json({
      user: {
        id: userId,
        name: profile?.full_name ?? (locale === "ar" ? "الطالب" : "Student"),
        email: user.email,
      },
      academic: {
        cgpa,
        totalCredits: totalCreditsFromCourses,
        completedCredits,
        requiredCredits,
        progress,
        activeCourses,
        remainingCredits,
        estimatedGraduation,
      },
      currentSemester,
      courseDistribution,
      recentActivity,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
