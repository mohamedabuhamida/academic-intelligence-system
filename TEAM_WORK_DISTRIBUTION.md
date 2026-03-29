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

## Current Implemented Features

The Academic Intelligence System currently includes a set of integrated product features designed to support both day-to-day student operations and AI-assisted academic decision-making.

### 1. Student Onboarding
The onboarding module allows a student to initialize the system with their academic identity and history.

Main capabilities:

- enter personal and university information
- define total required graduation hours
- add semester-by-semester academic history
- classify each course as completed, failed, current, or planned
- validate duplicate course entries within the same semester

Business value:

- gives the system a reliable academic baseline
- enables all downstream analytics and AI features

### 2. Editable Academic Profile
The profile module extends onboarding into a long-term academic record manager.

Main capabilities:

- edit personal information after initial setup
- update academic history when a new semester starts
- change course status from planned to current or completed
- maintain a continuously accurate student profile

Business value:

- ensures the system stays useful after initial onboarding
- keeps dashboard, Study Chat, and planner outputs current

### 3. Dashboard Overview
The dashboard gives the student a high-level academic snapshot.

Main capabilities:

- display CGPA
- show active course count
- show graduation progress
- present recent academic activity
- surface advisor insights and status summaries

Business value:

- gives students a fast understanding of their current standing
- centralizes academic intelligence in one page

### 4. Profile Freshness Alerts
The system checks whether student data is current and actionable.

Main capabilities:

- detect missing profile fields
- detect missing academic history
- detect when a newer semester exists in the system
- detect absence of current courses
- suggest planning for the next term
- warn about heavy current academic load

Business value:

- turns the dashboard into a proactive assistant
- improves the quality of downstream AI recommendations

### 5. General AI Academic Chat
The platform provides an AI chat experience for academic guidance beyond a single course.

Main capabilities:

- answer academic and policy-related questions
- support general academic guidance
- connect to the backend AI orchestration layer
- maintain conversation continuity through stored chat sessions

Business value:

- gives students a central AI assistant for academic support
- reduces friction in navigating academic rules and general questions

### 6. Study Chat
Study Chat is the course-specific AI learning assistant in the platform.

Main capabilities:

- select one course from current-semester registered courses
- create separate conversations per course
- ask grounded questions only within the selected course context
- choose one or multiple source documents before asking
- receive citations under responses

Business value:

- transforms the system from a dashboard into an actual study companion
- supports focused and explainable learning

### 7. Study Material Upload and Library
Students can upload course materials and build a reusable source library.

Supported formats:

- PDF
- Markdown
- TXT

Main capabilities:

- upload materials by course
- store file metadata such as source type, topic, lecture number, and week
- list, open, select, and delete uploaded materials
- reuse uploaded files across course study sessions

Business value:

- creates a personalized knowledge base for each student and course
- makes Study Chat grounded in actual lecture content

### 8. Study Modes
Study Chat supports several structured AI output modes.

Main capabilities:

- `Chat`
- `Summary`
- `Quiz`
- `Flashcards`
- `Expected Questions`
- `Study Plan`

Business value:

- adapts one AI backend to multiple study workflows
- improves usefulness for revision, active recall, and exam preparation

### 9. Retrieval-Augmented Generation for Study Materials
The system includes a full RAG pipeline for course-based studying.

Main capabilities:

- text extraction from uploaded files
- chunking with metadata enrichment
- embeddings generation
- vector-based retrieval
- filtered retrieval by course, user, and optionally selected documents
- answer generation with source attribution

Business value:

- reduces hallucination risk
- improves trust and academic usefulness of responses

### 10. Dashboard Analytics and Advisor Insights
The platform includes backend logic that converts academic data into insights.

Main capabilities:

- compute graduation progress
- calculate completed and remaining credits
- display course load context
- show advisor insight cards based on current data
- support future recommendation and risk analysis modules

Business value:

- supports informed student decision-making
- bridges raw academic records and actionable guidance

### 11. GPA and Progress Tracking
The system supports academic performance tracking features.

Main capabilities:

- display cumulative GPA
- calculate progress toward total required hours
- expose graded-credit-based statistics
- integrate GPA information into dashboard context

Business value:

- helps students monitor academic performance continuously
- supports planning and early intervention

### 12. Study Planner and Timeline Support
The project includes planning-oriented modules to organize academic progress over time.

Main capabilities:

- planner page for term-level planning
- timeline support for academic progress
- preparation for next-semester decision support
- integration with dashboard alerts and profile freshness logic

Business value:

- extends the system beyond reporting into planning
- helps the student move from reactive to proactive academic management

### 13. Authentication and Protected Routing
The platform uses authenticated access control for student-specific data.

Main capabilities:

- authenticated user access with Supabase Auth
- protected dashboard routes
- secure backend token-based request handling
- session refresh support in critical frontend flows

Business value:

- ensures each student only sees their own data
- protects sensitive academic information

### 14. File Storage and Citation Support
Uploaded documents are stored and referenced back in the UI.

Main capabilities:

- store files in Supabase Storage
- generate signed URLs for source access
- show linked source cards in Study Chat answers
- display short excerpts and metadata for retrieved sources

Business value:

- makes AI answers transparent and inspectable
- improves confidence in system-generated outputs

### 15. Multi-Module Integration
A core feature of the project is that the modules are not isolated.

Examples:

- onboarding feeds profile and dashboard
- profile data feeds Study Chat course selection
- uploaded study materials feed Study Chat retrieval
- profile freshness feeds dashboard alerts and notifications
- dashboard analytics support planning and advisor logic

Business value:

- creates a coherent academic intelligence platform
- ensures features reinforce each other instead of operating independently

---

## Future Features and Planned Enhancements

The following items represent the recommended next-stage roadmap for the Academic Intelligence System. These features are not only useful for future development, but also important to mention in graduation documentation to show the extensibility of the project.

### 1. Doctor/Admin Upload for Official Course Materials
Planned goal:

- allow instructors or administrators to upload official course resources

Expected value:

- combine student-uploaded materials with trusted official sources
- improve answer quality and course coverage
- reduce dependence on student-side uploads only

Potential scope:

- role-based upload permissions
- official source badge in Study Chat
- separation between personal sources and institutional sources

### 2. Advanced Semester Planner
Planned goal:

- expand the planner from a simple planning page into a semester decision engine

Expected value:

- recommend suitable next-semester course combinations
- consider prerequisites, difficulty, and workload
- support smarter academic scheduling

Potential scope:

- semester simulation
- recommended course bundles
- max/min credit load suggestions

### 3. What-If Simulation Engine
Planned goal:

- allow the student to simulate academic decisions before committing to them

Expected value:

- answer questions such as:
  - what happens if I take this course next term
  - what if I delay this course
  - what GPA do I need next semester

Potential scope:

- GPA impact simulation
- graduation delay estimation
- alternate semester path generation

### 4. Course Recommendation Engine
Planned goal:

- generate AI-assisted course recommendations tailored to the student profile

Expected value:

- personalize course planning
- identify better next steps based on performance and progress
- improve the transition from dashboard insight to actual action

Potential scope:

- recommendation scoring
- course suitability ranking
- prerequisite-aware recommendations

### 5. Risk Analysis and Early Warning Expansion
Planned goal:

- improve the system’s ability to detect academic risk earlier

Expected value:

- identify overload, poor progression, or GPA risk
- alert students before academic problems become severe
- support advisor-like intervention logic

Potential scope:

- academic risk score dashboard
- delayed graduation warnings
- high-difficulty semester detection

### 6. Smarter Study Chat Memory and Saved Outputs
Planned goal:

- improve continuity and persistence inside Study Chat

Expected value:

- let students preserve summaries, flashcards, and generated quizzes
- improve long-term study workflows across multiple sessions

Potential scope:

- saved notes per course
- reusable flashcards
- stored quiz history
- pinned answers

### 7. Richer Citation and Source Inspection
Planned goal:

- expand citations into a deeper evidence-viewing system

Expected value:

- improve explainability of AI responses
- let students inspect why a response was generated

Potential scope:

- chunk-level preview panels
- in-answer citation anchors
- side-by-side response and source inspection

### 8. Support for More File Types
Planned goal:

- expand study material support beyond PDF, Markdown, and TXT

Expected value:

- improve usability for real-world classroom content
- support broader lecturer and student workflows

Potential scope:

- PPTX
- DOCX
- scanned document OCR
- image-based lecture note support

### 9. Notification Center and Action History
Planned goal:

- move notifications from simple alerts into a richer activity and action layer

Expected value:

- improve dashboard usefulness
- give the student a record of what changed and what needs attention

Potential scope:

- read/unread alerts
- grouped notifications
- academic activity log

### 10. Analytics for Study Behavior
Planned goal:

- extend the system from academic record analysis into study behavior analysis

Expected value:

- identify which courses need more attention
- track interaction with uploaded study materials
- support smarter prioritization of study effort

Potential scope:

- study frequency per course
- source usage analytics
- engagement metrics for Study Chat sessions

### 11. Production Monitoring and Operational Readiness
Planned goal:

- move the platform toward production-grade reliability

Expected value:

- better debugging
- better issue detection
- improved maintainability after deployment

Potential scope:

- structured logs
- tracing
- performance monitoring
- upload and AI failure alerts

### 12. Role Expansion Beyond Students
Planned goal:

- support multiple user types in the future

Expected value:

- make the system usable by:
  - students
  - instructors
  - coordinators
  - academic advisors

Potential scope:

- separate dashboards by role
- role-based permissions
- advisor-facing student analytics

### 13. Mobile and Accessibility Improvements
Planned goal:

- strengthen usability across devices and user needs

Expected value:

- improve adoption and real-world usability
- make the platform more inclusive and reliable

Potential scope:

- mobile-first refinements
- keyboard-friendly navigation
- accessibility improvements for forms and chat

### 14. Deployment and Real-World Release Readiness
Planned goal:

- prepare the project for deployment beyond local development

Expected value:

- move the system closer to a real production environment
- support demonstration, pilot usage, or institutional adoption

Potential scope:

- deployment documentation
- environment hardening
- secret and config management
- backup and rollback strategy

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

Error format:

```json
{
  "status": "error",
  "answer": "Temporary internal error."
}
```

---

### 4. `/api/study/courses`

#### GET
Purpose:

- load the student’s currently active courses for the Study Chat page

Response format:

```json
{
  "currentSemester": {
    "id": "uuid",
    "name": "Level 3",
    "term": "spring",
    "academic_year": "2025/2026"
  },
  "courses": [
    {
      "id": "uuid",
      "code": "AI225",
      "name": "Processing Formal and Natural Languages",
      "creditHours": 3,
      "difficultyLevel": 3,
      "semesterId": "uuid"
    }
  ]
}
```

---

### 5. `/api/profile-freshness`

#### GET
Purpose:

- evaluate whether the student profile and academic state are up to date
- return dashboard alerts and notification items

Response format:

```json
{
  "summary": {
    "missingProfileFields": [],
    "hasAcademicHistory": true,
    "activeCourses": 6,
    "currentCredits": 18,
    "latestUserSemester": {
      "id": "uuid",
      "name": "Level 3",
      "term": "spring",
      "academic_year": "2025/2026"
    },
    "latestSystemSemester": {
      "id": "uuid",
      "name": "Level 4",
      "term": "fall",
      "academic_year": "2026/2027"
    }
  },
  "alerts": [
    {
      "id": "new-semester-available",
      "tone": "info",
      "title": "A newer semester is available",
      "message": "The latest semester in the system is newer than your recorded semester.",
      "ctaLabel": "Refresh profile",
      "ctaHref": "/dashboard/profile"
    }
  ]
}
```

---

## Data Flow for Study Chat

Study Chat is one of the most critical features in the system. The flow below describes how a study source becomes a grounded AI response.

### Step 1. Student Selects a Course
The student opens Study Chat and selects one of the courses currently marked as `current` in their academic record.

Frontend role:

- display available current-semester courses
- create a per-course session context
- show the relevant study library for the selected course

### Step 2. Student Uploads Study Material
The student uploads:

- PDF
- Markdown
- TXT

The upload is associated with:

- student ID
- course ID
- source metadata such as source type, topic, week, and lecture number

### Step 3. Backend Receives the File
The backend validates the request, stores the file in Supabase Storage, and creates a document record.

Backend actions:

- validate uploader identity
- store original file in storage bucket
- create a `documents` record
- prepare the file for text extraction

### Step 4. Text Extraction and Chunking
The backend extracts readable text from the file and splits it into chunks.

Processing includes:

- text extraction from PDF or plain text files
- normalization and cleanup
- chunking with overlap
- metadata enrichment per chunk

### Step 5. Embeddings Generation
Each chunk is passed through the embedding model.

Result:

- a semantic vector representation is generated
- the chunk plus embedding is stored in `document_chunks`

This forms the vector-searchable knowledge base for Study Chat.

### Step 6. Student Asks a Question
The student submits a question in Study Chat, optionally with:

- selected file filters
- a study mode such as summary or quiz
- a conversation/session context

### Step 7. Retrieval Happens
The backend:

- embeds the student question
- queries the vector store
- filters by course and uploader
- optionally filters by selected document IDs
- falls back to direct chunk retrieval when vector filtering returns no valid chunk for the chosen source set

### Step 8. LLM Generates the Answer
The retrieved chunks are assembled into a grounded prompt.

The LLM then produces:

- an answer in Arabic
- mode-specific formatting
- source citations with metadata

### Step 9. Frontend Displays the Response
The frontend renders:

- the answer body
- source cards
- file links
- short excerpts from the retrieved material

This ensures the answer is explainable and traceable to uploaded study materials.

---

## Team Structure

### Member 1: Frontend Lead / Dashboard & User Experience
Primary role:

- own the main student dashboard experience
- connect API data to UI cards, alerts, and overview widgets
- maintain shared UX consistency across pages

Main responsibilities:

- dashboard overview page
- top navigation and header interactions
- sidebar navigation and page discoverability
- alert presentation and profile freshness banners
- overall visual consistency and interaction polish

Strict ownership boundary:

- UI only
- no backend business logic ownership
- no AI retrieval ownership
- no persistence or analytics calculation ownership

Main files:

- [frontend/src/app/(student)/dashboard/page.tsx](/e:/academic-intelligence-system/frontend/src/app/(student)/dashboard/page.tsx)
- [frontend/src/components/Header.tsx](/e:/academic-intelligence-system/frontend/src/components/Header.tsx)
- [frontend/src/components/Sidebar.tsx](/e:/academic-intelligence-system/frontend/src/components/Sidebar.tsx)
- [frontend/src/components/Loading.tsx](/e:/academic-intelligence-system/frontend/src/components/Loading.tsx)
- [frontend/src/components/animations.tsx](/e:/academic-intelligence-system/frontend/src/components/animations.tsx)

Expected deliverables:

- polished dashboard UI
- connected notification and freshness alerts
- navigation consistency between major student pages

---

### Member 2: Academic Profile / Onboarding / Student Data Management
Primary role:

- manage student identity and academic record entry
- maintain correctness of onboarding and editable profile flows
- ensure semester and course history are stored consistently

Main responsibilities:

- onboarding flow
- editable academic profile
- academic history table
- validation for duplicate course entries per semester
- student course data submission and retrieval
- profile data correctness in relation to the database schema

Database ownership:

- primary owner of profile-related and student academic record data structures
- co-owner of schema decisions involving `profiles` and `student_courses`

Main files:

- [frontend/src/components/AcademicProfileEditor.tsx](/e:/academic-intelligence-system/frontend/src/components/AcademicProfileEditor.tsx)
- [frontend/src/app/(student)/dashboard/onboarding/page.tsx](/e:/academic-intelligence-system/frontend/src/app/(student)/dashboard/onboarding/page.tsx)
- [frontend/src/app/(student)/dashboard/profile/page.tsx](/e:/academic-intelligence-system/frontend/src/app/(student)/dashboard/profile/page.tsx)
- [frontend/src/app/api/onboarding/route.ts](/e:/academic-intelligence-system/frontend/src/app/api/onboarding/route.ts)
- [frontend/src/middleware.ts](/e:/academic-intelligence-system/frontend/src/middleware.ts)

Expected deliverables:

- onboarding and profile management flow
- correct academic history validation
- secure user loading and protected routing support

---

### Member 3: Study Chat / Course Learning Experience
Primary role:

- own the student-facing study assistant
- build the NotebookLM-like study experience
- connect uploaded course materials to the AI study flow

Main responsibilities:

- Study Chat page and interactions
- per-course chat sessions
- quick study modes such as summary, quiz, flashcards, expected questions, and study plan
- source selection and course library UX
- citations and source cards shown under AI responses

Strict ownership boundary:

- owns Study Chat frontend experience
- does not own embeddings generation
- does not own vector database logic
- collaborates with Member 4 for API and retrieval integration

Main files:

- [frontend/src/app/(student)/dashboard/study-chat/page.tsx](/e:/academic-intelligence-system/frontend/src/app/(student)/dashboard/study-chat/page.tsx)
- [frontend/src/app/api/study/courses/route.ts](/e:/academic-intelligence-system/frontend/src/app/api/study/courses/route.ts)

Related integration files:

- [backend/app/api/chat.py](/e:/academic-intelligence-system/backend/app/api/chat.py)
- [backend/app/models/chat_models.py](/e:/academic-intelligence-system/backend/app/models/chat_models.py)

Expected deliverables:

- complete study chat user flow
- course-specific material selection
- usable AI learning outputs from uploaded sources

---

### Member 4: Backend AI / RAG / Document Processing
Primary role:

- own the AI backend that powers retrieval and responses
- process uploaded files into searchable chunks
- keep the system grounded on student-uploaded material

Main responsibilities:

- study material ingestion
- chunking and embeddings
- vector retrieval and filtering
- study-mode-aware prompting
- citations and structured source output
- AI grounding quality and response traceability

Strict ownership boundary:

- owns AI orchestration, embeddings, retrieval, and vector-storage-facing logic
- owns document-processing pipelines
- does not own main dashboard analytics
- collaborates with Member 3 for Study Chat integration and Member 5 for backend consistency

Database ownership:

- primary owner of AI-oriented tables and retrieval metadata
- responsible for `documents` and `document_chunks` data contracts

Main files:

- [backend/app/agents/rag_agent.py](/e:/academic-intelligence-system/backend/app/agents/rag_agent.py)
- [backend/app/api/study_materials.py](/e:/academic-intelligence-system/backend/app/api/study_materials.py)
- [backend/app/services/embeddings_service.py](/e:/academic-intelligence-system/backend/app/services/embeddings_service.py)
- [backend/app/api/chat.py](/e:/academic-intelligence-system/backend/app/api/chat.py)
- [backend/app/models/chat_models.py](/e:/academic-intelligence-system/backend/app/models/chat_models.py)
- [backend/requirements.txt](/e:/academic-intelligence-system/backend/requirements.txt)

Expected deliverables:

- working Study RAG pipeline
- PDF/Markdown/TXT ingestion
- retrieval filtered by course, user, and selected source

---

### Member 5: Academic Intelligence / Planner / Analytics / QA & Integration
Primary role:

- own academic planning and system-level integration
- connect dashboard analytics with planner and recommendation logic
- perform final integration testing and project readiness checks

Main responsibilities:

- dashboard backend metrics
- advisor insights and analytics
- profile freshness backend logic
- planner, GPA, and timeline support
- final QA across the full student journey
- system contract verification between frontend and backend

Strict ownership boundary:

- owns APIs, analytics, and backend decision-support logic
- owns integration-level validation
- does not own pure frontend rendering
- does not own the AI retrieval pipeline internals

Database ownership:

- co-owner of analytics-facing and planning-related database usage
- owner of data consistency across dashboard, advisor, planner, and alert APIs

Main files:

- [frontend/src/app/api/dashboard/route.ts](/e:/academic-intelligence-system/frontend/src/app/api/dashboard/route.ts)
- [frontend/src/app/api/advisor/route.ts](/e:/academic-intelligence-system/frontend/src/app/api/advisor/route.ts)
- [frontend/src/app/api/profile-freshness/route.ts](/e:/academic-intelligence-system/frontend/src/app/api/profile-freshness/route.ts)
- [frontend/src/app/(student)/dashboard/planner/page.tsx](/e:/academic-intelligence-system/frontend/src/app/(student)/dashboard/planner/page.tsx)
- [frontend/src/app/(student)/dashboard/gpa/page.tsx](/e:/academic-intelligence-system/frontend/src/app/(student)/dashboard/gpa/page.tsx)
- [frontend/src/app/(student)/dashboard/timeline/page.tsx](/e:/academic-intelligence-system/frontend/src/app/(student)/dashboard/timeline/page.tsx)
- [frontend/src/lib/advisor.ts](/e:/academic-intelligence-system/frontend/src/lib/advisor.ts)
- [docker-compose.yml](/e:/academic-intelligence-system/docker-compose.yml)

Expected deliverables:

- dashboard analytics and alerts
- planner-related logic
- testing checklist and final system stabilization

---

## Ownership Boundaries

To avoid ambiguity, ownership must be enforced at both the feature level and the file level.

### Fully Owned Areas

- Member 1:
  dashboard presentation and shared UI shell
- Member 2:
  onboarding, profile management, academic history validation
- Member 3:
  Study Chat frontend experience
- Member 4:
  AI retrieval, embeddings, chunking, and vector-based study intelligence
- Member 5:
  analytics APIs, planning logic, alerts backend, and integration QA

### Shared Resources
The following files or modules are shared and require coordination:

- [frontend/src/components/Header.tsx](/e:/academic-intelligence-system/frontend/src/components/Header.tsx)
- [frontend/src/components/Sidebar.tsx](/e:/academic-intelligence-system/frontend/src/components/Sidebar.tsx)
- [backend/app/api/chat.py](/e:/academic-intelligence-system/backend/app/api/chat.py)
- [backend/app/models/chat_models.py](/e:/academic-intelligence-system/backend/app/models/chat_models.py)
- [docker-compose.yml](/e:/academic-intelligence-system/docker-compose.yml)

### Shared Resource Rules

- Member 1 controls shared UI structure and visual consistency
- Member 4 controls AI-related contract changes in chat payloads
- Member 5 controls integration consistency and API compatibility
- Member 2 must approve any changes affecting profile or academic history semantics

No shared file should be modified without:

- notifying the owner
- confirming impact scope
- re-running validation after merge

---

## Suggested Ownership Model
To avoid conflicts, each team member should have a main ownership area:

- Member 1: shared UI shell and dashboard presentation
- Member 2: profile and academic record CRUD
- Member 3: student learning UX and Study Chat frontend
- Member 4: backend AI, ingestion, retrieval, and chat integration
- Member 5: planner/analytics/backend integration and QA

Shared files should only be edited after coordination:

- [frontend/src/components/Header.tsx](/e:/academic-intelligence-system/frontend/src/components/Header.tsx)
- [frontend/src/components/Sidebar.tsx](/e:/academic-intelligence-system/frontend/src/components/Sidebar.tsx)
- [backend/app/api/chat.py](/e:/academic-intelligence-system/backend/app/api/chat.py)
- [backend/app/models/chat_models.py](/e:/academic-intelligence-system/backend/app/models/chat_models.py)
- [docker-compose.yml](/e:/academic-intelligence-system/docker-compose.yml)

---

## Logging and Monitoring

Although this is an academic project, basic operational observability is still required.

### Backend Logging
The backend should maintain structured or semi-structured logs for:

- incoming API requests
- authentication failures
- file upload operations
- study material processing steps
- AI/RAG execution outcomes
- unexpected exceptions

Typical logging targets:

- request path
- request method
- user ID when available
- endpoint success or failure
- processing duration for file ingestion or chat retrieval

### Error Handling Strategy
The error handling policy should be:

- validate early at the API boundary
- return safe, user-friendly messages to the frontend
- log the technical exception details on the backend
- avoid exposing internal stack traces to end users

Examples:

- invalid onboarding payload -> return validation error
- unauthorized request -> return `401`
- failed file extraction -> return safe upload failure message
- AI retrieval exception -> return fallback response and log backend details

### AI Debug Logging
For Study Chat and AI responses, optional debug logs should include:

- selected course ID
- selected document IDs
- retrieval source count
- fallback usage when vector search fails
- timing for embeddings and retrieval stages

These logs should be used for:

- debugging empty-answer cases
- diagnosing AI grounding issues
- validating the citation pipeline

### Monitoring Recommendations
For a real production version, the following should be added:

- request tracing
- centralized logs
- error-rate dashboards
- alerting on failed uploads or failed AI requests

---

## Risks and Challenges

The following risks are important from both engineering and delivery perspectives:

### 1. API Integration Conflicts
Risk:

- frontend and backend payloads may diverge over time

Impact:

- broken forms
- invalid AI requests
- dashboard sections failing silently

Mitigation:

- document API contracts clearly
- assign ownership to Member 5 for integration validation
- retest shared contracts after changes

### 2. Inconsistent Data Between Frontend and Backend
Risk:

- frontend assumptions may not match database state

Examples:

- no current courses despite academic history existing
- new semester alerts appearing unexpectedly
- duplicate semester and course combinations

Mitigation:

- stronger backend validation
- explicit data freshness checks
- profile and academic history normalization

### 3. AI Hallucination or Ungrounded Answers
Risk:

- LLM may generate unsupported answers if retrieval is weak

Impact:

- incorrect academic guidance
- poor trust in Study Chat

Mitigation:

- strict RAG prompting
- source-only grounding
- visible citations and excerpts
- logging fallback cases

### 4. Large File Processing Delays
Risk:

- large PDFs may slow extraction, chunking, or embeddings generation

Impact:

- delayed uploads
- timeouts
- poor user experience

Mitigation:

- chunking strategy with limits
- file-size restrictions if required
- progress feedback in frontend

### 5. Shared File Merge Conflicts
Risk:

- common files such as chat models, header, sidebar, and shared APIs may become merge hotspots

Mitigation:

- strict ownership rules
- branch-based workflow
- coordination before editing shared files

### 6. Authentication and Session Reliability
Risk:

- stale or invalid sessions may affect protected pages or backend requests

Mitigation:

- authenticated user retrieval from trusted auth calls
- token refresh handling on the frontend
- consistent protected-route middleware

---

## Recommended Workflow

### Branching
- each member should work on a separate branch
- merge only after local verification
- shared files should be merged carefully and reviewed by the owner

### Minimum verification before merge
- frontend changes: run `npx tsc --noEmit`
- backend changes: run Python syntax checks or app startup checks
- feature changes: test the relevant end-to-end flow manually

### Coordination meetings
- short sync every day or every 2 days
- confirm integration blockers early
- track which files are shared versus owned

### Suggested merge gate
Before merging any feature:

- verify API contract compatibility
- verify ownership impact
- run targeted local testing
- record what files changed and why

---

## Suggested Submission Narrative
If you need to explain the team effort in a report or presentation, you can use this structure:

### Member 1
- designed and integrated the dashboard experience
- improved alerts, navigation, and overall user flow
- maintained consistency in shared frontend layout and interaction design

### Member 2
- built onboarding and academic profile management
- handled academic history validation and profile updates
- maintained correctness of student academic record storage

### Member 3
- implemented the Study Chat interface
- added course sessions, source selection, and study modes
- improved citation rendering and course-based study UX

### Member 4
- built the RAG pipeline and study material ingestion
- connected uploaded documents to grounded AI responses
- managed chunking, embeddings, retrieval filters, and AI source grounding

### Member 5
- implemented academic analytics, dashboard APIs, and planner support
- handled final integration, alerts logic, and readiness validation
- ensured system-wide consistency between frontend, backend, and data flow

---

## Optional Team Table
Replace the names in this table before final use.

| Team Member | Main Role | Main Modules | Main Files |
|---|---|---|---|
| Member 1 | Frontend Lead | Dashboard, Header, Sidebar, UX | dashboard page, Header, Sidebar |
| Member 2 | Profile & Onboarding | Student profile, onboarding, academic history | AcademicProfileEditor, onboarding API |
| Member 3 | Study Chat Frontend | Study Chat, sessions, materials library | study-chat page, study courses API |
| Member 4 | AI Backend & RAG | retrieval, embeddings, ingestion, chat backend | rag_agent, study_materials, embeddings_service |
| Member 5 | Planner, Analytics, QA | dashboard APIs, advisor, planner, alerts, QA | dashboard API, advisor API, profile-freshness API |

---

## Handoff Checklist

Before delivery, the team should ensure the following:

- all roles are assigned to actual team names
- all shared files are reviewed
- API contracts are consistent with implementation
- Study Chat flow is tested end-to-end
- onboarding and profile updates are verified
- dashboard metrics match actual stored academic data
- key risks and limitations are documented

---

## Final Note
This division is designed to:

- reduce overlap between team members
- make accountability clear
- simplify presentation of each person's role
- show both technical ownership and feature ownership

If needed, this document can be converted into:

- a presentation slide
- a formal project report section
- a grading appendix showing individual contribution
- a technical handoff document for future maintainers
