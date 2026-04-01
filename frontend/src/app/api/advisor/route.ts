import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAdvisorInsights } from "@/lib/advisor";
import { defaultLocale, isSupportedLocale } from "@/lib/i18n/config";

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
    const advisor = buildAdvisorInsights({
      fullName: profile?.full_name,
      cgpa: Number(cgpaData?.cgpa ?? 0),
      totalRequiredHours: profile?.total_required_hours,
      studentCourses: courses,
      riskItems,
      latestPlan,
      locale,
    });

    return NextResponse.json({
      user: {
        name: profile?.full_name ?? "Student",
      },
      academic: advisor.academic,
      insights: advisor.insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Advisor API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
