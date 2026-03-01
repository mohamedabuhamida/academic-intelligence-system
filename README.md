# 🎓 Multi-Agent Academic Decision Intelligence System

An intelligent, multi-agent academic ecosystem designed to assist students and administrators with GPA simulation, course planning, and risk prediction.

The system uses a **Central Brain (Orchestrator)** to route user requests to specialized AI agents.

![System Architecture](./architecture.png)



---

# 🚀 System Architecture

The project is divided into four main layers:

## 1️⃣ User Interface Layer (Frontend)

* Next.js dashboard
* GPA simulators
* Course planner
* Chat assistant interface

## 2️⃣ Orchestration Layer (Central Brain)

* FastAPI backend
* Intent detection
* Conditional routing
* State management
* Response aggregation

## 3️⃣ Multi-Agent Layer

Specialized AI agents:

* **GPA Agent** → Deterministic logic for grade calculations
* **Rule Agent** → Validates academic constraints & prerequisites
* **Risk Prediction Agent** → ML-powered student success forecasting
* **Planner Agent** → Optimization engine for course scheduling
* **RAG Agent** → Retrieves university policy information from documents

## 4️⃣ Data Layer

* Supabase (PostgreSQL + pgvector)
* Vector Store for document retrieval
* ML Model storage

---

# 🛠 Tech Stack

## Frontend

* Next.js 15
* Tailwind CSS
* Lucide Icons
* Supabase Auth

## Backend

* FastAPI (Python 3.10)
* LangGraph / LangChain (Orchestration)
* Pydantic

## Database

* Supabase (PostgreSQL)
* pgvector (Vector Store)
* Supabase Storage

## Infrastructure

* Docker
* Docker Compose

---

# 📂 Project Structure

```
/academic-intelligence-system
├── backend/
│   ├── app/
│   │   ├── agents/        # Specialized agent logic (GPA, RAG, Risk, etc.)
│   │   ├── core/          # Orchestration & shared state
│   │   └── main.py        # FastAPI entry point
│   └── Dockerfile
│
├── frontend/
│   ├── src/               # Next.js components and pages
│   └── Dockerfile
│
├── .env                   # Shared environment variables
└── docker-compose.yml     # Orchestrates frontend & backend
```

---

# ⚙️ Setup & Installation

## 1️⃣ Prerequisites

* Docker installed
* A Supabase project created
* OpenAI API Key (or another LLM provider)

---

## 2️⃣ Environment Variables

Create a `.env` file in the root directory:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-key

# Database Connection
DATABASE_URL=postgresql://postgres:[password]@db.[id].supabase.co:5432/postgres

# AI Configuration
OPENAI_API_KEY=sk-your-key-here

# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 3️⃣ Running with Docker

From the root directory:

```
# Build and start both frontend and backend

docker-compose up --build
```

### Access the Application

* Frontend → [http://localhost:3000](http://localhost:3000)
* Backend API Docs → [http://localhost:8000/docs](http://localhost:8000/docs)

---

# 🤖 Agents & Logic Overview

| Agent        | Responsibility             | Implementation                        |
| ------------ | -------------------------- | ------------------------------------- |
| Orchestrator | Intent detection & routing | LangGraph state machine               |
| GPA Agent    | Numeric grade simulation   | Deterministic Python logic            |
| RAG Agent    | Policy & handbook QA       | Supabase pgvector + OpenAI embeddings |
| Risk Agent   | Predictive analytics       | Scikit-Learn / Pre-trained ML models  |
| Rule Agent   | Prerequisite checking      | Custom rule engine                    |

---

# 📜 Development Workflow

## ➕ Add a New Agent

1. Create a new file inside:

   ```
   backend/app/agents/
   ```
2. Register it inside the orchestrator/router in:

   ```
   backend/app/core/
   ```

---

## 🎨 UI Updates

Changes inside:

```
frontend/src/
```

Will hot-reload automatically when using Docker (if volumes are configured).

---

## 🗄 Data Schema

* Managed via Supabase Dashboard
* Or SQL migrations

---

# 🏆 Vision

This system is designed as:

* A research-level AI architecture
* A scalable academic decision platform
* A multi-agent orchestration demo using LangGraph
* A potential startup-ready foundation

