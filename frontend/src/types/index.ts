import { Database } from './database.types';

export type Tables = Database['public']['Tables'];
export type Profile = Tables['profiles']['Row'];
export type Course = Tables['courses']['Row'] & {
  program?: Program;
  prerequisites?: Course[];
};
export type Program = Tables['programs']['Row'] & {
  faculty?: Faculty;
};
export type Faculty = Tables['faculties']['Row'] & {
  university?: University;
};
export type University = Tables['universities']['Row'];
export type StudentCourse = Tables['student_courses']['Row'] & {
  course?: Course;
  semester?: Semester;
};
export type Semester = Tables['semesters']['Row'];
export type SemesterPlan = Tables['semester_plans']['Row'] & {
  courses?: Course[];
};
export type RiskAnalysis = Tables['risk_analysis']['Row'] & {
  course?: Course;
};
export type Document = Tables['documents']['Row'];
export type GPAHistory = Tables['gpa_history']['Row'];

export type AIStatus = 'online' | 'processing' | 'idle';

export interface AIStatusData {
  status: AIStatus;
  model: string;
  tokensUsed: number;
  tokensLimit: number;
}

export interface DashboardData {
  profile: Profile | null;
  currentCourses: StudentCourse[];
  upcomingDeadlines: (StudentCourse & { course: Course })[];
  recentGrades: (StudentCourse & { course: Course })[];
  riskAnalysis: (RiskAnalysis & { course: Course })[];
  semesterPlans: (SemesterPlan & { courses: Course[] })[];
  gpaHistory: GPAHistory[];
}