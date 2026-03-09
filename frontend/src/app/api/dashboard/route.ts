// app/api/dashboard/route.ts
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

    // Get all courses with their details
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

    const getCreditHours = (
      courseRelation:
        | { credit_hours: number | null }
        | Array<{ credit_hours: number | null }>
        | null
        | undefined,
    ) => {
      const course = Array.isArray(courseRelation)
        ? courseRelation[0]
        : courseRelation;
      return Number(course?.credit_hours ?? 0);
    };

    // Calculate metrics
    const activeCourses = courses?.filter(c => c.status === "current").length || 0;
    
    // Calculate completed credits
    const completedCredits = courses
      ?.filter(c => c.status === "completed")
      .reduce((sum, c) => sum + getCreditHours(c.courses), 0) || 0;

    // Calculate CGPA from ALL completed courses
    const completedWithGrades = courses?.filter(c => 
      c.status === "completed" && c.grade_points && getCreditHours(c.courses) > 0
    ) || [];
    
    let cgpa = 0;
    let totalPoints = 0;
    let totalCredits = 0;
    
    completedWithGrades.forEach(c => {
      const credits = getCreditHours(c.courses);
      const gradePoints = Number(c.grade_points) || 0;
      totalPoints += gradePoints * credits;
      totalCredits += credits;
    });
    
    if (totalCredits > 0) {
      cgpa = Number((totalPoints / totalCredits).toFixed(3));
    }

    const requiredCredits = profile?.total_required_hours ?? 142;
    const progress = requiredCredits > 0 
      ? Math.min(Math.round((completedCredits / requiredCredits) * 100), 100) 
      : 0;

    // Create recent activity based on actual data
    const recentActivity = [
      {
        action: "CGPA",
        detail: cgpa.toString(),
        time: "Cumulative GPA",
      },
      {
        action: "Total Credits",
        detail: `${completedCredits} of ${requiredCredits} credits completed`,
        time: `${progress}% complete`,
      },
      {
        action: "Courses Completed",
        detail: `${completedWithGrades.length} courses completed`,
        time: "To date",
      }
    ];

    if (activeCourses > 0) {
      recentActivity.unshift({
        action: "Active Courses",
        detail: `${activeCourses} courses in progress`,
        time: "Current semester",
      });
    }

    const response = {
      user: {
        id: userId,
        name: profile?.full_name ?? "Student",
        email: user.email,
      },
      gpa: cgpa, // Now this is CGPA, not just last semester GPA
      activeCourses,
      completedCredits,
      requiredCredits,
      progress,
      recentActivity,
      // Add semester breakdown for reference
      semesterBreakdown: {
        totalSemesters: 4,
        totalCourses: completedWithGrades.length,
        totalCredits,
        cgpa,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
