# Team Work Distribution

## Purpose
This document explains how the project can be divided across a 5-person team, the main responsibility of each member, the files each member owns or primarily worked on, and the expected deliverables for documentation, demo, and handoff.

This version is expanded to serve as a production-level internal handoff document suitable for:

- graduation project submission
- technical review
- team onboarding
- implementation ownership tracking
- post-delivery maintenance

You can replace `Member 1` to `Member 5` with the actual team names before submission.

---

## Project Overview
The project is an academic intelligence platform that helps students with:

- academic onboarding and profile management
- semester/course tracking
- GPA and progress monitoring
- AI chat for academic guidance
- Study Chat for course-based studying with uploaded materials
- study planning and timeline support
- dashboard insights and academic alerts

The system is split into:

- `frontend/`: Next.js application and dashboard UI
- `backend/`: FastAPI services, RAG logic, embeddings, and AI orchestration
- `docker-compose.yml`: local orchestration for frontend/backend services

At a business level, the system combines traditional academic information management with AI-powered assistance. It is designed to serve both operational student needs, such as profile updates and course tracking, and higher-value intelligence tasks, such as academic planning and document-grounded study support.

---

## System Architecture Overview

The Academic Intelligence System is organized into five major architectural layers:

### 1. Frontend Layer
The frontend is implemented using `Next.js` and acts as the student-facing interface.

Responsibilities:

- render dashboard pages and academic workflows
- manage authenticated navigation and protected pages
- collect and validate form input before sending requests
- display AI outputs, study citations, and dashboard alerts

Core frontend domains:

- dashboard and overview
- onboarding and academic profile
- Study Chat
- planner, GPA calculator, and timeline
- notifications and profile freshness alerts

### 2. Backend Application Layer
The backend is implemented using `FastAPI` and exposes the core business and AI-facing endpoints.

Responsibilities:

- request validation
- authenticated API handling
- study material ingestion
- AI orchestration and RAG execution
- integration with storage and database

Core backend domains:

- chat endpoints
- study materials APIs
- embeddings and vector preparation
- orchestration and agent routing

### 3. AI Layer
The AI layer combines:

- LLM invocation
- retrieval-augmented generation
- embeddings generation
- prompt control for grounded academic responses

This layer powers:

- academic regulation question answering
- study-material-based responses
- summary, quiz, flashcards, expected questions, and study planning modes

### 4. Database Layer
The project uses `Supabase`, which is built on top of `PostgreSQL`, as the main relational database platform.

Responsibilities:

- store academic and user entities
- maintain course/semester relationships
- store onboarding and profile data
- persist chat sessions and study material metadata
- store vector chunks and associated retrieval metadata

### 5. File Storage Layer
The system uses `Supabase Storage` for uploaded study materials such as:

- PDF files
- Markdown files
- TXT files

Uploaded files are processed and stored as source documents for Study Chat retrieval.

### High-Level Request Flow
The standard request path is:

`User -> Frontend (Next.js) -> Backend/API (FastAPI or Next API route) -> AI/RAG or Database/Storage -> Response -> Frontend UI`

For AI study interactions, the flow becomes:

`User -> Study Chat UI -> Chat API -> Retrieval + Embeddings + LLM -> Database/Vector Chunks -> Answer with citations -> Frontend`

---

## Database Architecture

### Database Type
The system uses `Supabase PostgreSQL` as the primary structured database, with `Supabase Storage` for file storage and a `vector-enabled table strategy` for embeddings-based retrieval.

This means the system combines:

- relational data modeling for academic entities
- object storage for uploaded documents
- vector search through an embeddings-backed chunk table

### Main Data Domains

#### 1. Users and Identity
Main entities:

- `profiles`
- authenticated `users` through Supabase Auth

Purpose:

- store student identity and role
- link authenticated user accounts to academic data
- maintain high-level profile data such as department and required hours

Typical fields:

- user ID
- full name
- department
- university
- total required hours
- role

#### 2. Academic Structure
Main entities:

- `universities`
- `faculties`
- `programs`
- `semesters`
- `courses`
- `course_prerequisites`

Purpose:

- define the academic catalog
- organize semester and course relationships
- support planning, progress analysis, and prerequisite validation

#### 3. Student Academic State
Main entities:

- `student_courses`
- `student_cgpa`
- `gpa_history`
- `academic_states`
- `risk_analysis`
- `semester_plans`

Purpose:

- track the student’s completed, current, failed, and planned courses
- compute CGPA and progress
- support advisor insights and planning recommendations
- preserve system-calculated academic state

#### 4. Study Materials and AI Retrieval
Main entities:

- `documents`
- `document_chunks`

Purpose:

- store uploaded study material records
- split files into chunks for semantic retrieval
- associate chunk metadata with course, uploader, topic, lecture number, and source type

#### 5. Chat and Session Continuity
Main entities:

- `conversations`
- `messages`

Purpose:

- preserve user chat sessions
- separate general AI chat from course-based study sessions
- support per-course continuity and message history

### High-Level Entity Relationships

The relationships below describe the system at a conceptual level:

- one authenticated user maps to one `profile`
- one `profile` can have many `student_courses`
- one `student_course` links one student to one `course` in one `semester`
- one `course` may have many prerequisites through `course_prerequisites`
- one student may have many `conversations`
- one `conversation` has many `messages`
- one uploaded study source becomes one `document`
- one `document` is split into many `document_chunks`
- each `document_chunk` belongs to one `document`
- each study `document` is logically associated with one course and one uploader

### Database Ownership and Management
Database design and ownership should be explicit:

- `Member 2` owns student profile data modeling and the correctness of academic record CRUD flows
- `Member 4` owns AI-related data structures such as `documents`, `document_chunks`, retrieval metadata, and vector-related processing
- `Member 5` owns analytics-oriented tables, dashboard data consistency, advisor/risk-related data usage, and cross-module data correctness

Shared database governance:

- schema changes affecting student academic records must be reviewed by Member 2 and Member 5
- schema changes affecting AI retrieval or embeddings must be reviewed by Member 4
- schema changes affecting shared contracts must be documented before merge

---

## API Contracts

The following contracts describe the expected behavior of the major system APIs. They are intentionally simplified for readability while remaining useful for development, testing, and review.

### 1. `/api/onboarding`

#### GET
Purpose:

- load the student’s current profile and academic setup data for onboarding or profile management

Response format:

```json
{
  "profile": {
    "full_name": "Ahmed Mohamed",
    "department": "Computer Science",
    "university_id": "uuid",
    "total_required_hours": 142
  },
  "universities": [],
  "semesters": [],
  "courses": [],
  "studentCourses": [],
  "gradeScale": []
}
```

#### POST
Purpose:

- save or update the student profile and academic history

Request body:

```json
{
  "fullName": "Ahmed Mohamed",
  "department": "Computer Science",
  "universityId": "uuid",
  "totalRequiredHours": 142,
  "academicHistory": [
    {
      "semesterId": "uuid",
      "courseId": "uuid",
      "status": "current",
      "grade": null,
      "gradePoints": null
    }
  ]
}
```

Response format:

```json
{
  "success": true
}
```

Error examples:

```json
{
  "error": "Please complete your profile details and add your academic history."
}
```

---

### 2. `/api/dashboard`

#### GET
Purpose:

- return dashboard metrics, user summary, and recent academic activity

Response format:

```json
{
  "user": {
    "id": "uuid",
    "name": "Ahmed Mohamed",
    "email": "student@example.com"
  },
  "academic": {
    "cgpa": 3.57,
    "totalCredits": 51,
    "completedCredits": 51,
    "requiredCredits": 142,
    "progress": 36,
    "activeCourses": 6,
    "remainingCredits": 91,
    "estimatedGraduation": "6 semesters"
  },
  "currentSemester": {
    "name": "Level 3",
    "term": "spring",
    "academic_year": "2025/2026"
  },
  "recentActivity": []
}
```

---

### 3. `/api/chat`

Note:
In the codebase, the effective backend chat route is implemented as `POST /api/ask`, but for project documentation it should be treated as the main chat contract.

#### POST
Purpose:

- send a user message to the AI layer
- support both general chat and Study Chat mode

Request body:

```json
{
  "question": "Summarize the key ideas in this lecture",
  "context_mode": "study",
  "course_id": "uuid",
  "course_code": "AI225",
  "course_name": "Processing Formal and Natural Languages",
  "selected_document_ids": ["uuid"],
  "study_mode": "summary",
  "conversation_id": "uuid"
}
```

Response format:

```json
{
  "status": "success",
  "answer": "Arabic answer returned by the AI",
  "sources": [
    {
      "document_id": "uuid",
      "title": "LEC1.pdf",
      "excerpt": "short retrieved excerpt",
      "source_type": "lecture",
      "topic": "Formal languages",
      "week": "Week 1",
      "lecture_number": "1"
    }
  ]
}
```
