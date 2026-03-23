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

    // Run queries in parallel for better performance
    const [profileResult, cgpaResult, coursesResult] = await Promise.all([
      // Get profile
      supabase
        .from("profiles")
        .select("full_name, total_required_hours")
        .eq("id", userId)
        .maybeSingle(),
      
      // Get CGPA from student_cgpa table (now using the new table)
      supabase
        .from("student_cgpa")
        .select("cgpa, total_credits, updated_at")
        .eq("user_id", userId)
        .maybeSingle(),
      
      // Get all courses with their details
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
        .order("created_at", { ascending: false })
    ]);

    const profile = profileResult.data;
    const cgpaData = cgpaResult.data;
    const { data: courses, error: coursesError } = coursesResult;

    if (coursesError) {
      console.error("Courses error:", coursesError);
    }

    // Helper function to safely get credit hours
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

    // Calculate metrics
    const activeCourses = courses?.filter(c => c.status === "current").length || 0;
    
    // Calculate completed credits
    const completedCredits = courses
      ?.filter(c => c.status === "completed")
      .reduce((sum, c) => sum + getCreditHours(c.courses), 0) || 0;

    // Get completed courses with grades
    const completedWithGrades = courses?.filter(c => 
      c.status === "completed" && c.grade_points && getCreditHours(c.courses) > 0
    ) || [];

    // Use CGPA from student_cgpa table if available, otherwise calculate
    let cgpa = 0;
    let totalPoints = 0;
    let totalCreditsFromCourses = 0;
    
    if (cgpaData?.cgpa) {
      cgpa = Number(cgpaData.cgpa);
      totalCreditsFromCourses = cgpaData.total_credits || 0;
    } else {
      // Fallback calculation if student_cgpa table doesn't have data
      completedWithGrades.forEach(c => {
        const credits = getCreditHours(c.courses);
        const gradePoints = Number(c.grade_points) || 0;
        totalPoints += gradePoints * credits;
        totalCreditsFromCourses += credits;
      });
      
      if (totalCreditsFromCourses > 0) {
        cgpa = Number((totalPoints / totalCreditsFromCourses).toFixed(3));
      }
    }

    const requiredCredits = profile?.total_required_hours ?? 142;
    const progress = requiredCredits > 0 
      ? Math.min(Math.round((completedCredits / requiredCredits) * 100), 100) 
      : 0;

    // Get current semester info (if any active courses)
    let currentSemester = null;
    if (activeCourses > 0 && courses) {
      const currentSemesterId = courses.find(c => c.status === "current")?.semester_id;
      if (currentSemesterId) {
        const { data: semester } = await supabase
          .from("semesters")
          .select("name, term, academic_year")
          .eq("id", currentSemesterId)
          .single();
        currentSemester = semester;
      }
    }

    // Get course distribution by difficulty
    const courseDistribution = {
      easy: completedWithGrades.filter(c => {
        const difficultyLevel = getCourseDetails(c.courses)?.difficulty_level;
        return difficultyLevel !== null && difficultyLevel !== undefined && difficultyLevel <= 2;
      }).length,
      medium: completedWithGrades.filter(c => getCourseDetails(c.courses)?.difficulty_level === 3).length,
      hard: completedWithGrades.filter(c => {
        const difficultyLevel = getCourseDetails(c.courses)?.difficulty_level;
        return difficultyLevel !== null && difficultyLevel !== undefined && difficultyLevel >= 4;
      }).length,
    };

    // Create recent activity based on actual data
    const recentActivity = [
      {
        action: "Cumulative GPA",
        detail: cgpa.toFixed(3),
        time: cgpaData?.updated_at 
          ? new Date(cgpaData.updated_at).toLocaleDateString('ar-SA')
          : "Current",
        icon: "graduation",
      },
      {
        action: "Credit Completion",
        detail: `${completedCredits} of ${requiredCredits} credits`,
        time: `${progress}% complete`,
        icon: "credits",
      },
      {
        action: "Courses Completed",
        detail: `${completedWithGrades.length} courses`,
        time: `${courseDistribution.easy + courseDistribution.medium + courseDistribution.hard} total`,
        icon: "courses",
      }
    ];

    if (activeCourses > 0) {
      recentActivity.unshift({
        action: "Currently Enrolled",
        detail: `${activeCourses} active courses`,
        time: currentSemester 
          ? `${currentSemester.term === 'fall' ? 'خريف' : currentSemester.term === 'spring' ? 'ربيع' : 'صيف'} ${currentSemester.academic_year}`
          : "Current semester",
        icon: "active",
      });
    }

    // Calculate estimated graduation
    const creditsPerSemester = 15; // Average credits per semester
    const remainingCredits = Math.max(0, requiredCredits - completedCredits);
    const estimatedSemestersRemaining = Math.ceil(remainingCredits / creditsPerSemester);
    const estimatedGraduation = estimatedSemestersRemaining > 0 
      ? `${estimatedSemestersRemaining} فصول دراسية` 
      : "مؤهل للتخرج";

    const response = {
      user: {
        id: userId,
        name: profile?.full_name ?? "Student",
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
