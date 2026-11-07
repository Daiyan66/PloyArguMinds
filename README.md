# PolyArguMinds

> **Autonomous Dialectic Stress-Testing Engine & Executive Decision Arbiter**

PolyArguMinds is a mission-critical platform where founders, executives, engineers, and researchers submit proposals, architecture designs, or contentious policy decisions to watch a committee of specialized, grounded AI agents red-team the idea and produce a derisked **Executive Decision Memorandum**.

---

## 🌟 Key Features

- **Dynamic Persona Synthesizer**: Analyzes topic tension (e.g. Velocity vs Resilience, CapEx vs Capital Efficiency) and dynamically spawns specialized domain experts with opposing worldviews.
- **Phased Argumentation Guidance**: Structured multi-turn dialectic cycling through Foundation (definition & boundaries), Evidence (empirical grounding & data), and Clash (direct rebuttal & deconstruction).
- **Real-Time Logician Referee**: Evaluates turns asynchronously for informal fallacies (*Strawman, Ad Hominem, False Dichotomy, Slippery Slope, Circular Reasoning*).
- **RAG & Grounding**: Upload PRDs, technical RFCs, or budgets (PDF/TXT). Agents cite specific page numbers, clauses, and empirical data points.
- **Human-in-the-Loop Steering Bar**: Inject hard constraints into the live state graph mid-debate (e.g. *"Must cap budget increase at 10%"*).
- **Frontier Chief Adjudicator**: Delivers a formal Decision Memo with a multi-rubric evaluation matrix, key concessions, unresolved blind spots, and an exportable PDF.
- **Server-Sent Events (SSE)**: Character-paced token streaming with sub-100ms latency.

---

## 🏗️ Architecture

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

### Option A: Run Locally (Zero Setup)

#### 1. Backend (FastAPI + LangGraph)
```bash
# Activate virtual environment
.\venv\Scripts\activate   # Windows
# or: source venv/bin/activate # Linux/Mac

# Run server
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend (Next.js 15 + React 19 + Tailwind)
```bash
cd frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

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

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | SQLAlchemy Async connection string | `sqlite+aiosqlite:///./polyarguminds.db` |
| `FAST_LLM_PROVIDER` | Debater & Referee LLM provider | `gemini` (or `openai`, `anthropic`, `mock`) |
| `REASONING_LLM_PROVIDER`| Frontier Chief Adjudicator provider | `gemini` (or `claude`, `openai`, `mock`) |
| `GEMINI_API_KEY` | Google Gemini API Key | Optional |
| `OPENAI_API_KEY` | OpenAI API Key | Optional |
| `ANTHROPIC_API_KEY` | Anthropic Claude API Key | Optional |
| `TAVILY_API_KEY` | Web search grounding tool | Optional |
