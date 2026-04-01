import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppLocale, defaultLocale, isSupportedLocale } from "@/lib/i18n/config";

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

function translateFieldName(field: string, locale: AppLocale) {
  if (locale === "ar") {
    switch (field) {
      case "full name":
        return "الاسم الكامل";
      case "department":
        return "القسم";
      case "university":
        return "الجامعة";
      case "required hours":
        return "الساعات المطلوبة";
      default:
        return field;
    }
  }

  return field;
}

function localizeSemesterFallback(locale: AppLocale) {
  return locale === "ar" ? "آخر فصل لديك" : "your latest semester";
}

function semesterLabelForLocale(semester: SemesterRecord | null, locale: AppLocale) {
  if (!semester) return localizeSemesterFallback(locale);
  return [semester.academic_year, semester.term, semester.name].filter(Boolean).join(" - ");
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
      const localizedMissingFields = missingProfileFields.map((field) => translateFieldName(field, locale));
      alerts.push({
        id: "profile-missing-fields",
        tone: "warning",
        title: locale === "ar" ? "أكمل ملفك الأكاديمي" : "Complete your academic profile",
        message:
          locale === "ar"
            ? `لا يزال ملفك ينقصه ${localizedMissingFields.join("، ")}. تحديثه يحافظ على دقة التخطيط ولوحة المعلومات.`
            : `Your profile is still missing ${localizedMissingFields.join(", ")}. Updating it keeps planning and dashboard insights accurate.`,
        ctaLabel: locale === "ar" ? "تحديث الملف" : "Update profile",
        ctaHref: "/dashboard/profile",
      });
    }

    if (studentCourses.length === 0) {
      alerts.push({
        id: "no-history",
        tone: "warning",
        title: locale === "ar" ? "أضف سجلك الأكاديمي" : "Add your academic history",
        message:
          locale === "ar"
            ? "لوحة المعلومات تعمل، لكن لا توجد سجلات فصول مرتبطة بملفك حتى الآن."
            : "Your dashboard is active, but there are no semester records linked to your profile yet.",
        ctaLabel: locale === "ar" ? "إضافة المقررات" : "Add courses",
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
        title: locale === "ar" ? "يوجد فصل أحدث متاح" : "A newer semester is available",
        message:
          locale === "ar"
            ? `أحدث فصل في النظام هو ${semesterLabelForLocale(latestSystemSemester, locale)}، بينما آخر سجل أكاديمي لديك هو ${semesterLabelForLocale(latestUserSemester, locale)}.`
            : `The latest semester in the system is ${semesterLabelForLocale(latestSystemSemester, locale)}, but your latest academic record is ${semesterLabelForLocale(latestUserSemester, locale)}.`,
        ctaLabel: locale === "ar" ? "تحديث الملف" : "Refresh profile",
        ctaHref: "/dashboard/profile",
      });
    }

    if (studentCourses.length > 0 && activeCourses.length === 0) {
      alerts.push({
        id: "no-current-courses",
        tone: "info",
        title: locale === "ar" ? "لا توجد مقررات حالية مسجلة" : "No current courses listed",
        message:
          locale === "ar"
            ? "أضف مقررات هذا الفصل الحالية حتى تبقى دردشة الدراسة والتخطيط وتتبع التقدم متوافقة."
            : "Add this term's current courses so Study Chat, planning, and progress tracking stay in sync.",
        ctaLabel: locale === "ar" ? "إضافة المقررات الحالية" : "Add current courses",
        ctaHref: "/dashboard/profile",
      });
    }

    if (currentCredits >= 18) {
      alerts.push({
        id: "heavy-load",
        tone: "warning",
        title: locale === "ar" ? "تم رصد عبء دراسي مرتفع" : "Heavy current load detected",
        message:
          locale === "ar"
            ? `لديك حاليًا ${currentCredits} ساعة معتمدة مسجلة كمقررات حالية. راجع خطة فصلك وأولويات الدراسة.`
            : `You currently have ${currentCredits} credit hours marked as current. Consider reviewing your semester plan and study priorities.`,
        ctaLabel: locale === "ar" ? "مراجعة المخطط" : "Review planner",
        ctaHref: "/dashboard/planner",
      });
    }

    if (activeCourses.length > 0 && plannedCourses.length === 0) {
      alerts.push({
        id: "no-planned-courses",
        tone: "success",
        title: locale === "ar" ? "وقت مناسب للتخطيط مبكرًا" : "Good time to plan ahead",
        message:
          locale === "ar"
            ? "تم تسجيل فصلك الحالي. أضف بعض المقررات المخططة للفصول القادمة لتحسين التوصيات."
            : "Your current semester is recorded. Add a few planned courses for upcoming terms to improve recommendations.",
        ctaLabel: locale === "ar" ? "خطط للفصل القادم" : "Plan next term",
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
