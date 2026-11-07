from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.db import init_db
from app.api.routes_sessions import router as sessions_router
from app.api.routes_stream import router as stream_router
from app.api.routes_files import router as files_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema on startup
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Autonomous Dialectic Stress-Testing Engine & Executive Decision Arbiter",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(sessions_router)
app.include_router(stream_router)
app.include_router(files_router)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "fast_llm_provider": settings.FAST_LLM_PROVIDER,
        "reasoning_llm_provider": settings.REASONING_LLM_PROVIDER
    }
