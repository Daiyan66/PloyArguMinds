# PolyArguMinds

> **Autonomous Dialectic Stress-Testing Engine & Executive Decision Arbiter**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1+-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-Cyclic_Agents-blue)](https://langchain-ai.github.io/langgraph/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-Llama_3.3_70B-purple)](https://openrouter.ai)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_Sync-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

PolyArguMinds is an executive-grade dialectic reasoning platform where founders, executives, engineers, and researchers stress-test technical proposals, architectural trade-offs, or contentious corporate policies. A committee of specialized, grounded AI agents red-teams the topic and generates a formal, derisked **Executive Decision Memorandum**.

---

## 🌟 Key Features

- **Dual Dialectic Postures**:
  - **Red-Team Stress-Test (`DEBATE`)**: Adversarial friction between a Lead Advocate and Chief Skeptic to uncover edge-cases, cost hazards, and unverified assumptions.
  - **Collaborative Review (`COLLABORATIVE`)**: Constructive architectural analysis between a Lead Strategist and Principal Reviewer seeking synergy and consensus.
- **Dynamic Persona Synthesizer**: Analyzes topic friction (e.g. Velocity vs Resilience, CapEx vs Capital Efficiency) and dynamically spawns specialized domain experts with opposing worldviews.
- **Custom Argumentation Depth**: Tune debate intensity anywhere from **1 to 10 rounds** (2 to 20 turns) with continuous sliding adjustment.
- **Phased Guidance**: Multi-turn dialectic cycling through **Foundation** (boundary definitions), **Evidence** (empirical metrics & data), and **Clash** (rebuttal & deconstruction).
- **Real-Time Logician Referee**: Evaluates turns asynchronously for informal fallacies (*Strawman, Ad Hominem, False Dichotomy, Slippery Slope, Circular Reasoning*).
- **RAG & Grounding**: Upload PRDs, RFCs, or budgets (PDF/TXT). Agents cite specific page numbers, clauses, and empirical data points.
- **Human-in-the-Loop Steering Bar**: Inject hard constraints into the live state graph mid-debate (e.g. *"Must cap cloud budget increase at 10%"*).
- **Executive Decision Report (PDF Export)**: Multi-rubric scorecard matrix, round-by-round argument breakdown, key concessions, unresolved blind spots, and an exportable formal PDF.
- **Server-Sent Events (SSE)**: Character-paced token streaming with sub-100ms latency.

---

## 🏗️ Multi-Agent Architecture

```text
               ┌─────────────────────────────────────────┐
               │ 1. Document / Proposal Ingestion        │
               │ (PDF parsing, chunking, embeddings)     │
               └────────────────────┬────────────────────┘
                                    │
                                    ▼
               ┌─────────────────────────────────────────┐
               │ 2. Dynamic Persona Synthesizer          │
               │ (Extracts core friction, spawns experts)│
               └────────────────────┬────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    │                                                               │
    ▼                                                               ▼
┌─────────────────┐       Tool: RAG / Grounding         ┌─────────────────────────┐
│     Agent A     │ ◄─────────────────────────────────► │      Fact-Checker       │
│ (Lead Advocate) │                                     │  (Grounding Validation) │
└────────┬────────┘                                     └────────────┬────────────┘
         │ Next Turn (SSE Streamed)                                  │ Injects Fallacy Badges
         ▼                                                           ▼
┌─────────────────┐       Tool: RAG / Grounding         ┌─────────────────────────┐
│     Agent B     │ ◄─────────────────────────────────► │       Referee Bot       │
│ (Chief Skeptic) │                                     │(Detects Fallacies&Rigor)│
└────────┬────────┘                                     └─────────────────────────┘
         │
         ▼ (Human-in-the-Loop Interjection Hook)
┌─────────────────────────────────────────────────────────────┐
│ 3. Human Interjection Hook: Insert Constraint / Steering    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Loop until round limit)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Chief Adjudication & Executive Synthesis                 │
│ (Frontier Judge: Rubric Evaluation & Derisked Decision Memo)│
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart

### Option A: Local Dev (Zero Setup)

#### 1. Backend (FastAPI + LangGraph)
```bash
# Run server directly from project root
.\venv\Scripts\python run_backend.py
```
*API running at `http://127.0.0.1:8000` (Interactive Swagger Docs at `/docs`)*

#### 2. Frontend (Next.js 15 + React 19 + Tailwind)
```bash
cd frontend
npm run dev
```
*UI running at `http://localhost:3000`*

---

### Option B: Docker Compose (PostgreSQL 16 + pgvector)

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

---

## 🧪 Testing

Run backend tests:
```bash
.\venv\Scripts\pytest backend\tests -v
```

---

## ⚙️ Configuration (.env)

Copy `.env.example` to `.env` to configure your environment:

```ini
# Database & Cache (SQLite local, PostgreSQL + pgvector, or MongoDB Atlas)
DATABASE_URL=sqlite+aiosqlite:///./polyarguminds.db
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/

# LLM Inference (OpenRouter, Gemini, OpenAI, Claude)
OPENROUTER_API_KEY=your_key_here
FAST_LLM_MODEL=meta-llama/llama-3.3-70b-instruct
REASONING_LLM_MODEL=meta-llama/llama-3.3-70b-instruct

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```
