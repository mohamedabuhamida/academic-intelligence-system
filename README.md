# Academic Intelligence System

An intelligent academic support platform designed to help students with GPA simulation, course planning, policy questions, and personalized academic guidance.

The system uses a central orchestration layer to route user requests to specialized AI capabilities.

![System Architecture](./architecture.png)

---

## System Architecture

The project is divided into four main layers:

### 1. User Interface Layer

- Next.js dashboard
- GPA simulator
- Course planner
- Chat assistant interface

### 2. Orchestration Layer

- FastAPI backend
- Intent detection
- Conditional routing
- State management
- Response aggregation

### 3. AI Agent Layer

Current and planned AI capabilities include:

- GPA support for academic performance calculations
- Planner support for semester strategy and course selection
- RAG support for academic regulations and handbook questions
- Rule validation for prerequisites and registration constraints
- Risk analysis for workload awareness

### 4. Data Layer

- Supabase PostgreSQL
- pgvector for retrieval
- Supabase Auth
- Supabase Storage

---

## Tech Stack

### Frontend

- Next.js 15
- React 19
- Tailwind CSS
- Framer Motion
- Supabase Auth

### Backend

- FastAPI
- LangGraph / LangChain
- Pydantic

### Database

- Supabase PostgreSQL
- pgvector

### Infrastructure

- Docker
- Docker Compose

---

## Project Structure

```text
/academic-intelligence-system
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   ├── api/
│   │   ├── core/
│   │   ├── orchestration/
│   │   ├── services/
│   │   └── main.py
│   └── Dockerfile
├── frontend/
│   ├── src/
│   └── Dockerfile
├── .env
├── docker-compose.yml
└── README.md
```

---

## Setup

### Prerequisites

- Docker
- A Supabase project
- An OpenAI API key or another supported LLM provider key

### Environment Variables

Create a `.env` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:[password]@db.[id].supabase.co:5432/postgres

# AI
OPENAI_API_KEY=sk-your-key-here

# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Run with Docker

```bash
docker-compose up --build
```

### Default Local URLs

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`

---

## Current Product Areas

- Authentication and onboarding
- Dashboard overview
- GPA calculator and projection
- Planner eligibility and recommendation flow
- Academic chat assistant
- RAG-based policy question answering

---

## Development Notes

### Add a New Agent

1. Create a file in `backend/app/agents/`
2. Register it in the routing/orchestration layer

### Frontend Updates

Most UI work lives in `frontend/src/`.

### Data Schema

The current project uses Supabase-managed schema and generated frontend database types.

---

## Vision

This system is intended to grow into:

- A strong academic support MVP
- A multi-capability academic intelligence platform
- A research and product demo for orchestration with AI agents
