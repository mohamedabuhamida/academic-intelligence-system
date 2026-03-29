export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      academic_states: {
        Row: {
          id: string
          user_id: string | null
          state: Json | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          state?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          state?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_states_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      course_prerequisites: {
        Row: {
          id: string
          course_id: string | null
          prerequisite_id: string | null
        }
        Insert: {
          id?: string
          course_id?: string | null
          prerequisite_id?: string | null
        }
        Update: {
          id?: string
          course_id?: string | null
          prerequisite_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_prerequisites_course_id_fkey"
            columns: ["course_id"]
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_prerequisites_prerequisite_id_fkey"
            columns: ["prerequisite_id"]
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      courses: {
        Row: {
          id: string
          name: string
          code: string | null
          credit_hours: number
          difficulty_level: number | null
          created_at: string | null
          program_id: string | null
          level: number | null
        }
        Insert: {
          id?: string
          name: string
          code?: string | null
          credit_hours: number
          difficulty_level?: number | null
          created_at?: string | null
          program_id?: string | null
          level?: number | null
        }
        Update: {
          id?: string
          name?: string
          code?: string | null
          credit_hours?: number
          difficulty_level?: number | null
          created_at?: string | null
          program_id?: string | null
          level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_program_id_fkey"
            columns: ["program_id"]
            referencedRelation: "programs"
            referencedColumns: ["id"]
          }
        ]
      }
      document_chunks: {
        Row: {
          id: string
          document_id: string | null
          content: string | null
          metadata: Json | null
          embedding: unknown | null
        }
        Insert: {
          id?: string
          document_id?: string | null
          content?: string | null
          metadata?: Json | null
          embedding?: unknown | null
        }
        Update: {
          id?: string
          document_id?: string | null
          content?: string | null
          metadata?: Json | null
          embedding?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "documents"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          university_id: string | null
          uploaded_by: string | null
          title: string | null
          file_url: string | null
          uploaded_at: string | null
        }
        Insert: {
          id?: string
          university_id?: string | null
          uploaded_by?: string | null
          title?: string | null
          file_url?: string | null
          uploaded_at?: string | null
        }
        Update: {
          id?: string
          university_id?: string | null
          uploaded_by?: string | null
          title?: string | null
          file_url?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_university_id_fkey"
            columns: ["university_id"]
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      faculties: {
        Row: {
          id: string
          university_id: string | null
          name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          university_id?: string | null
          name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          university_id?: string | null
          name?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculties_university_id_fkey"
            columns: ["university_id"]
            referencedRelation: "universities"
            referencedColumns: ["id"]
          }
        ]
      }
      gpa_history: {
        Row: {
          id: string
          user_id: string | null
          gpa: number | null
          total_credits: number | null
          recorded_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          gpa?: number | null
          total_credits?: number | null
          recorded_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          gpa?: number | null
          total_credits?: number | null
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gpa_history_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          university_id: string | null
          full_name: string | null
          department: string | null
          role: string | null
          total_required_hours: number | null
          created_at: string | null
        }
        Insert: {
          id: string
          university_id?: string | null
          full_name?: string | null
          department?: string | null
          role?: string | null
          total_required_hours?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          university_id?: string | null
          full_name?: string | null
          department?: string | null
          role?: string | null
          total_required_hours?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_university_id_fkey"
            columns: ["university_id"]
            referencedRelation: "universities"
            referencedColumns: ["id"]
          }
        ]
      }
      programs: {
        Row: {
          id: string
          faculty_id: string | null
          name: string
        }
        Insert: {
          id?: string
          faculty_id?: string | null
          name: string
        }
        Update: {
          id?: string
          faculty_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_faculty_id_fkey"
            columns: ["faculty_id"]
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          }
        ]
      }
      risk_analysis: {
        Row: {
          id: string
          user_id: string | null
          course_id: string | null
          risk_score: number | null
          risk_level: string | null
          confidence: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          course_id?: string | null
          risk_score?: number | null
          risk_level?: string | null
          confidence?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          course_id?: string | null
          risk_score?: number | null
          risk_level?: string | null
          confidence?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_analysis_course_id_fkey"
            columns: ["course_id"]
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_analysis_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      semester_plan_courses: {
        Row: {
          id: string
          plan_id: string | null
          course_id: string | null
        }
        Insert: {
          id?: string
          plan_id?: string | null
          course_id?: string | null
        }
        Update: {
          id?: string
          plan_id?: string | null
          course_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "semester_plan_courses_course_id_fkey"
            columns: ["course_id"]
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "semester_plan_courses_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "semester_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      semester_plans: {
        Row: {
          id: string
          user_id: string | null
          semester_name: string | null
          total_credits: number | null
          predicted_gpa: number | null
          overall_risk: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          semester_name?: string | null
          total_credits?: number | null
          predicted_gpa?: number | null
          overall_risk?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          semester_name?: string | null
          total_credits?: number | null
          predicted_gpa?: number | null
          overall_risk?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "semester_plans_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      semesters: {
        Row: {
          id: string
          name: string | null
          academic_year: string | null
          term: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          academic_year?: string | null
          term?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          academic_year?: string | null
          term?: string | null
        }
        Relationships: []
      }
      student_courses: {
        Row: {
          id: string
          user_id: string | null
          course_id: string | null
          grade: string | null
          grade_points: number | null
          status: string | null
          created_at: string | null
          semester_id: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          course_id?: string | null
          grade?: string | null
          grade_points?: number | null
          status?: string | null
          created_at?: string | null
          semester_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          course_id?: string | null
          grade?: string | null
          grade_points?: number | null
          status?: string | null
          created_at?: string | null
          semester_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_courses_course_id_fkey"
            columns: ["course_id"]
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_courses_semester_id_fkey"
            columns: ["semester_id"]
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_courses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      universities: {
        Row: {
          id: string
          name: string
          country: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          country?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          country?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}