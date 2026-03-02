import { createClient } from './client';
import { DashboardData, Profile, StudentCourse, RiskAnalysis } from '@/types';

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = createClient();

  // Get user profile with university
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      university:universities(*)
    `)
    .eq('id', userId)
    .single();

  // Get current semester
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const term = currentMonth < 5 ? 'spring' : currentMonth < 8 ? 'summer' : 'fall';
  
  const { data: currentSemester } = await supabase
    .from('semesters')
    .select('*')
    .eq('academic_year', currentYear.toString())
    .eq('term', term)
    .single();

  // Get current courses with details
  const { data: currentCourses } = await supabase
    .from('student_courses')
    .select(`
      *,
      course:courses(
        *,
        program:programs(
          *,
          faculty:faculties(*)
        )
      ),
      semester:semesters(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'current')
    .eq('semester_id', currentSemester?.id);

  // Get upcoming deadlines (current courses with due dates from documents)
  const { data: upcomingDeadlines } = await supabase
    .from('student_courses')
    .select(`
      *,
      course:courses(
        *,
        program:programs(*)
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'current')
    .order('created_at', { ascending: true })
    .limit(5);

  // Get recent grades
  const { data: recentGrades } = await supabase
    .from('student_courses')
    .select(`
      *,
      course:courses(
        *,
        program:programs(*)
      )
    `)
    .eq('user_id', userId)
    .in('status', ['completed', 'failed'])
    .order('created_at', { ascending: false })
    .limit(5);

  // Get risk analysis
  const { data: riskAnalysis } = await supabase
    .from('risk_analysis')
    .select(`
      *,
      course:courses(
        *,
        program:programs(*)
      )
    `)
    .eq('user_id', userId)
    .order('risk_score', { ascending: false })
    .limit(3);

  // Get semester plans
  const { data: semesterPlans } = await supabase
    .from('semester_plans')
    .select(`
      *,
      courses:semester_plan_courses(
        course:courses(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Get GPA history
  const { data: gpaHistory } = await supabase
    .from('gpa_history')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false });

  return {
    profile: profile || null,
    currentCourses: (currentCourses as StudentCourse[]) || [],
    upcomingDeadlines: (upcomingDeadlines as any) || [],
    recentGrades: (recentGrades as any) || [],
    riskAnalysis: (riskAnalysis as (RiskAnalysis & { course: Course })[]) || [],
    semesterPlans: (semesterPlans as any) || [],
    gpaHistory: gpaHistory || [],
  };
}

export async function updateStudentCourseGrade(
  studentCourseId: string,
  grade: string,
  gradePoints: number
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('student_courses')
    .update({ grade, grade_points: gradePoints, status: 'completed' })
    .eq('id', studentCourseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createSemesterPlan(
  userId: string,
  semesterName: string,
  courseIds: string[]
) {
  const supabase = createClient();

  // Create semester plan
  const { data: plan, error: planError } = await supabase
    .from('semester_plans')
    .insert({
      user_id: userId,
      semester_name: semesterName,
      total_credits: 0, // Will be calculated
      predicted_gpa: 0,
      overall_risk: 0,
    })
    .select()
    .single();

  if (planError) throw planError;

  // Add courses to plan
  const planCourses = courseIds.map(courseId => ({
    plan_id: plan.id,
    course_id: courseId,
  }));

  const { error: coursesError } = await supabase
    .from('semester_plan_courses')
    .insert(planCourses);

  if (coursesError) throw coursesError;

  return plan;
}