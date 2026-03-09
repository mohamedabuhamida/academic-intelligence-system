import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, total_required_hours")
      .eq("id", userId)
      .single();

    // Get latest GPA - Fix: Use maybeSingle() instead of single() to handle potential no data
    const { data: gpaData } = await supabase
      .from("gpa_history")
      .select("gpa")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // FIXED: Get courses with correct join syntax
    const { data: courses, error: coursesError } = await supabase
      .from("student_courses")
      .select(`
        status,
        courses (
          credit_hours
        )
      `)
      .eq("user_id", userId);

    if (coursesError) {
      console.error("Courses query error:", coursesError);
    }

    console.log("Raw courses data:", JSON.stringify(courses, null, 2));

    // Calculate metrics
    const activeCourses = courses?.filter((c) => c.status === "current").length || 0;

    const completedCredits = courses
      ?.filter((c) => c.status === "completed")
      .reduce((sum, c) => {
        // Access the nested courses data correctly
        const creditHours = c.courses?.credit_hours || 0;
        return sum + creditHours;
      }, 0) || 0;

    const requiredCredits = profile?.total_required_hours ?? 142;
    const progress = requiredCredits > 0 
      ? Math.min(Math.round((completedCredits / requiredCredits) * 100), 100) 
      : 0;

    // Calculate real GPA from your data if gpa_history is empty
    let gpa = Number(gpaData?.gpa) || 0;
    
    // If no GPA in history but we have courses, calculate it
    if (gpa === 0 && courses && courses.length > 0) {
      const completedWithGrades = courses.filter(c => 
        c.status === "completed" && c.courses?.credit_hours
      );
      
      if (completedWithGrades.length > 0) {
        // You would need grade_points from student_courses to calculate GPA
        // This is just a placeholder - you'd need to add grade_points to your select
        console.log("Consider calculating GPA from grade_points");
      }
    }

    // Create dynamic recent activity based on actual data
    const recentActivity = [];
    
    if (completedCredits > 0) {
      recentActivity.push({
        action: "Course Progress Updated",
        detail: `${completedCredits} credits completed`,
        time: "Today",
      });
    }
    
    if (gpa > 0) {
      recentActivity.push({
        action: "GPA Updated",
        detail: `Current GPA: ${gpa.toFixed(2)}`,
        time: "Recently",
      });
    }

    // If no activities yet, show a welcome message
    if (recentActivity.length === 0) {
      recentActivity.push({
        action: "Welcome to Academic Dashboard",
        detail: "Start tracking your courses",
        time: "Now",
      });
    }

    const response = {
      user: {
        id: userId,
        name: profile?.full_name ?? "Student",
        email: user.email,
      },
      gpa: gpa,
      activeCourses,
      completedCredits,
      requiredCredits,
      progress,
      recentActivity,
    };

    console.log("Dashboard Data:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}