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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, total_required_hours")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    // Get latest GPA
    const { data: gpaData, error: gpaError } = await supabase
      .from("gpa_history")
      .select("gpa")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (gpaError) {
      console.error("GPA error:", gpaError);
    }

    // FIXED: Get courses with proper join syntax
    const { data: courses, error: coursesError } = await supabase
      .from("student_courses")
      .select(`
        status,
        grade_points,
        courses (
          credit_hours,
          name,
          code
        )
      `)
      .eq("user_id", userId);

    if (coursesError) {
      console.error("Courses error:", coursesError);
    }

    console.log("Raw courses:", JSON.stringify(courses, null, 2));

    // Calculate metrics
    const activeCourses = courses?.filter((c) => c.status === "current").length || 0;

    // Calculate completed credits
    const completedCredits = courses
      ?.filter((c) => c.status === "completed")
      .reduce((sum, c) => {
        // Access the nested courses data correctly
        const creditHours = c.courses?.credit_hours || 0;
        return sum + creditHours;
      }, 0) || 0;

    // Calculate GPA from completed courses if available
    let gpa = Number(gpaData?.gpa) || 0;
    
    // If no GPA in history but we have completed courses with grades, calculate it
    if (gpa === 0 && courses && courses.length > 0) {
      const completedWithGrades = courses.filter(c => 
        c.status === "completed" && c.grade_points && c.courses?.credit_hours
      );
      
      if (completedWithGrades.length > 0) {
        let totalPoints = 0;
        let totalCredits = 0;
        
        completedWithGrades.forEach(c => {
          const credits = c.courses?.credit_hours || 0;
          const gradePoints = Number(c.grade_points) || 0;
          totalPoints += gradePoints * credits;
          totalCredits += credits;
        });
        
        if (totalCredits > 0) {
          gpa = Number((totalPoints / totalCredits).toFixed(2));
        }
      }
    }

    const requiredCredits = profile?.total_required_hours ?? 142;
    const progress = requiredCredits > 0 
      ? Math.min(Math.round((completedCredits / requiredCredits) * 100), 100) 
      : 0;

    // Create dynamic recent activity
    const recentActivity = [];
    
    if (courses && courses.length > 0) {
      // Add course completion activities
      const completedCount = courses.filter(c => c.status === "completed").length;
      if (completedCount > 0) {
        recentActivity.push({
          action: "Courses Completed",
          detail: `${completedCount} courses (${completedCredits} credits)`,
          time: "To date",
        });
      }
      
      // Add current courses
      if (activeCourses > 0) {
        recentActivity.push({
          action: "Currently Enrolled",
          detail: `${activeCourses} active courses`,
          time: "Current semester",
        });
      }
    }
    
    if (gpa > 0) {
      recentActivity.push({
        action: "Current GPA",
        detail: gpa.toFixed(2),
        time: "Latest",
      });
    }

    // If no activities yet, show welcome message
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
      gpa,
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