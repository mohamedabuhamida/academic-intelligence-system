# Academic Intelligence System

An AI-powered academic support platform built for students who need help with course planning, GPA tracking, academic progress visibility, and policy-aware study guidance.

This repository contains:

- A `Next.js` frontend for authentication, dashboards, GPA tools, planner flows, and chat interfaces
- A `FastAPI` backend for orchestration, RAG, embeddings, and academic assistant APIs
- `Supabase` for authentication, database access, and storage
- `Google Gemini` models for LLM and embedding workflows

![System Architecture](./asesst/architecture.png)

## What The System Does

The current codebase supports these core product areas:

- Student authentication and onboarding
- Dashboard and academic profile management
- GPA calculation and projection
- Eligible course lookup and planner recommendations
- Academic chat and study chat experiences
- RAG-backed policy and study-material support
- Timeline and progress-related frontend APIs

## Architecture Overview

### Frontend

The frontend is built with `Next.js 15`, `React 19`, and `Tailwind CSS 4`.

Main responsibilities:

- Landing page and auth flows
- Student dashboard pages
- GPA and planner UI
- Chat interfaces
- Supabase session handling
- Client-side calls to frontend and backend APIs

### Backend

The backend is built with `FastAPI` and organizes AI logic across services, tools, and agents.

Main responsibilities:

- Chat and orchestration endpoints
- Embeddings and study-material endpoints
- Academic routing/orchestration logic
- RAG and memory services
- Planner and GPA-related backend utilities
- Gemini model access and Supabase integration

### Data and AI

- `Supabase PostgreSQL` for persisted application data
- `Supabase Auth` for authentication
- `Supabase Storage` for study materials
- `GoogleGenerativeAIEmbeddings` for embeddings
- `ChatGoogleGenerativeAI` for LLM-based orchestration and responses

## Tech Stack

### Frontend

- `Next.js 15`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `Framer Motion`
- `Supabase SSR`

### Backend

- `FastAPI`
- `Uvicorn`
- `LangChain`
- `LangGraph`
- `Pydantic`
- `SQLAlchemy`

### AI and Data

- `Google Gemini`
- `sentence-transformers`
- `Supabase`
- `PostgreSQL`

### Dev Environment

- `Docker`
- `Docker Compose`

## Repository Structure

```text
academic-intelligence-system/
|-- backend/
|   |-- app/
|   |   |-- agents/
|   |   |-- api/
|   |   |-- core/
|   |   |-- models/
|   |   |-- orchestration/
|   |   |-- services/
|   |   |-- tools/
|   |   `-- main.py
|   |-- Data/
|   |-- Dockerfile
|   `-- requirements.txt
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- app/
|   |   |-- components/
|   |   |-- lib/
|   |   `-- types/
|   |-- tests/
|   |-- Dockerfile
|   `-- package.json
|-- asesst/
|   |-- architecture.png
|   |-- PROJECT_STATUS_REPORT.md
|   `-- TEAM_WORK_DISTRIBUTION.md
|-- docker-compose.yml
|-- .env
`-- README.md
```

## Environment Variables

Create a root `.env` file and define the variables used by both the frontend and backend.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres

# Gemini / Google AI
GOOGLE_API_KEY=your-google-ai-key

# Frontend -> Backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Optional
SUPABASE_STUDY_MATERIALS_BUCKET=study-materials
```

Notes:

- The backend requires `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GOOGLE_API_KEY`
- The frontend uses `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_BACKEND_URL`
- `docker-compose.yml` also sets `NEXT_PUBLIC_API_URL=http://localhost:8000` for the frontend container

## Running With Docker

From the project root:

```bash
docker-compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Backend docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## Running Locally Without Docker

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Main Backend Endpoints

The FastAPI app currently mounts these main API areas:

- `chat`
- `embeddings`
- `study_materials`

Useful base routes:

- `GET /`
- `GET /health`
- `GET /docs`

## Key Frontend Areas

Important app sections in `frontend/src/app/` include:

- Landing page
- Login, signup, password reset, and verification flows
- Student dashboard
- GPA page
- Planner page
- Profile page
- Timeline page
- Chat and study-chat pages
- App API routes for advisor, onboarding, progress, dashboard, planner, courses, and GPA flows

## Development Notes

### Adding Backend Logic

- Add API routes under `backend/app/api/`
- Add reusable business logic under `backend/app/services/`
- Add new academic tools under `backend/app/tools/`
- Add agent logic under `backend/app/agents/`

### Adding Frontend Features

Most application UI work lives under:

- `frontend/src/app/`
- `frontend/src/components/`
- `frontend/src/lib/`

### Testing

The repo currently includes at least one frontend test file:

- `frontend/tests/advisor-logic.test.ts`

If you expand the project, this is a good place to add more unit and integration coverage.

## Current Direction

This project is structured as an academic intelligence platform that can continue growing into:

- A student-facing academic planning assistant
- A policy-aware university support chatbot
- A GPA and course-risk analysis tool
- A stronger multi-agent orchestration demo for academic advising use cases
