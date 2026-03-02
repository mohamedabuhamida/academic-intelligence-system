import { Database } from './database.types';

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Row types
export type Profile = Tables['profiles']['Row'];
export type Course = Tables['courses']['Row'];
export type Program = Tables['programs']['Row'];
export type Faculty = Tables['faculties']['Row'];
export type University = Tables['universities']['Row'];
export type StudentCourse = Tables['student_courses']['Row'];
export type Semester = Tables['semesters']['Row'];
export type SemesterPlan = Tables['semester_plans']['Row'];
export type RiskAnalysis = Tables['risk_analysis']['Row'];
export type Document = Tables['documents']['Row'];
export type DocumentChunk = Tables['document_chunks']['Row'];
export type GPAHistory = Tables['gpa_history']['Row'];
export type AcademicState = Tables['academic_states']['Row'];

// Insert types
export type ProfileInsert = Tables['profiles']['Insert'];
export type CourseInsert = Tables['courses']['Insert'];
export type StudentCourseInsert = Tables['student_courses']['Insert'];
export type SemesterPlanInsert = Tables['semester_plans']['Insert'];

// Update types
export type ProfileUpdate = Tables['profiles']['Update'];
export type CourseUpdate = Tables['courses']['Update'];
export type StudentCourseUpdate = Tables['student_courses']['Update'];

// Extended types with relationships
export interface CourseWithRelations extends Course {
  program?: ProgramWithRelations | null;
  prerequisites?: Course[];
  inverse_prerequisites?: CoursePrerequisite[];
}

export interface ProgramWithRelations extends Program {
  faculty?: FacultyWithRelations | null;
  courses?: Course[];
}

export interface FacultyWithRelations extends Faculty {
  university?: University | null;
  programs?: Program[];
}

export interface StudentCourseWithRelations extends StudentCourse {
  course?: CourseWithRelations | null;
  semester?: Semester | null;
}

export interface SemesterPlanWithRelations extends SemesterPlan {
  courses?: CourseWithRelations[];
  user?: Profile | null;
}

export interface RiskAnalysisWithRelations extends RiskAnalysis {
  course?: CourseWithRelations | null;
  user?: Profile | null;
}

export interface ProfileWithRelations extends Profile {
  university?: University | null;
  academic_states?: AcademicState[];
  gpa_history?: GPAHistory[];
  risk_analysis?: RiskAnalysis[];
  semester_plans?: SemesterPlan[];
  student_courses?: StudentCourseWithRelations[];
}

// Helper types
export type CoursePrerequisite = Tables['course_prerequisites']['Row'] & {
  course?: Course;
  prerequisite?: Course;
};

export type AIStatus = 'online' | 'processing' | 'idle';

export interface AIStatusData {
  status: AIStatus;
  model: string;
  tokensUsed: number;
  tokensLimit: number;
}

export interface DashboardData {
  profile: ProfileWithRelations | null;
  currentCourses: StudentCourseWithRelations[];
  upcomingDeadlines: (StudentCourseWithRelations & { course: CourseWithRelations })[];
  recentGrades: (StudentCourseWithRelations & { course: CourseWithRelations })[];
  riskAnalysis: (RiskAnalysisWithRelations & { course: CourseWithRelations })[];
  semesterPlans: (SemesterPlanWithRelations & { courses: CourseWithRelations[] })[];
  gpaHistory: GPAHistory[];
}