// app/api/debug/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Get profile
    const profile = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    // Get all GPA history (for reference)
    const gpaHistory = await supabase
      .from("gpa_history")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false });

    // Get all completed courses with their grades and credit hours
    const { data: courses, error: coursesError } = await supabase
      .from("student_courses")
      .select(`
        id,
        status,
        grade,
        grade_points,
        created_at,
        semester_id,
        courses (
          id,
          name,
          code,
          credit_hours
        )
      `)
      .eq("user_id", userId)
      .eq("status", "completed");

    // Calculate CGPA from all completed courses
    let cgpa = 0;
    let totalGradePoints = 0;
    let totalCredits = 0;
    let coursesWithGrades = [];

    if (courses && courses.length > 0) {
      coursesWithGrades = courses.filter(c => 
        c.grade_points && c.courses?.credit_hours
      );

      coursesWithGrades.forEach(c => {
        const credits = c.courses?.credit_hours || 0;
        const gradePoints = Number(c.grade_points) || 0;
        totalGradePoints += gradePoints * credits;
        totalCredits += credits;
      });

      if (totalCredits > 0) {
        cgpa = Number((totalGradePoints / totalCredits).toFixed(3));
      }
    }

    // Group courses by semester for better visualization
    const { data: coursesWithSemesters } = await supabase
      .from("student_courses")
      .select(`
        *,
        courses (*),
        semesters (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    // Group by semester
    const coursesBySemester = {};
    if (coursesWithSemesters) {
      coursesWithSemesters.forEach(c => {
        const semesterId = c.semester_id;
        if (!coursesBySemester[semesterId]) {
          coursesBySemester[semesterId] = {
            semester: c.semesters,
            courses: [],
            totalCredits: 0,
            semesterGPA: 0
          };
        }
        coursesBySemester[semesterId].courses.push(c);
        if (c.status === 'completed' && c.courses?.credit_hours) {
          coursesBySemester[semesterId].totalCredits += c.courses.credit_hours;
        }
      });

      // Calculate GPA for each semester
      Object.keys(coursesBySemester).forEach(semesterId => {
        const semester = coursesBySemester[semesterId];
        let semesterPoints = 0;
        let semesterCredits = 0;
        
        semester.courses.forEach(c => {
          if (c.status === 'completed' && c.grade_points && c.courses?.credit_hours) {
            semesterPoints += Number(c.grade_points) * c.courses.credit_hours;
            semesterCredits += c.courses.credit_hours;
          }
        });
        
        if (semesterCredits > 0) {
          semester.semesterGPA = Number((semesterPoints / semesterCredits).toFixed(3));
        }
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      profile: profile.data,
      cgpa: {
        value: cgpa,
        totalCredits,
        totalCourses: courses?.length || 0,
        coursesWithGrades: coursesWithGrades.length
      },
      gpaHistory: gpaHistory.data,
      summary: {
        totalCompletedCourses: courses?.length || 0,
        totalCreditsEarned: totalCredits,
        cgpa: cgpa
      },
      coursesBySemester: coursesBySemester,
      rawCourses: courses,
      errors: {
        profile: profile.error,
        gpaHistory: gpaHistory.error,
        courses: coursesError
      }
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}