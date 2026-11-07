from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "PolyArguMinds"
    DEBUG: bool = True

    # Database
    # Default can be SQLite for zero-setup local dev or PostgreSQL with pgvector
    DATABASE_URL: str = "sqlite+aiosqlite:///./polyarguminds.db"
    POSTGRES_DATABASE_URL: Optional[str] = None
    REDIS_URL: Optional[str] = None
    MONGODB_URI: Optional[str] = None

    # LLM Configurations
    FAST_LLM_PROVIDER: str = "openrouter"  # "openrouter" | "gemini" | "openai" | "anthropic" | "mock"
    FAST_LLM_MODEL: str = "meta-llama/llama-3.3-70b-instruct"
    FAST_LLM_API_KEY: Optional[str] = None

    REASONING_LLM_PROVIDER: str = "openrouter"  # "openrouter" | "gemini" | "openai" | "anthropic" | "mock"
    REASONING_LLM_MODEL: str = "meta-llama/llama-3.3-70b-instruct"
    REASONING_LLM_API_KEY: Optional[str] = None

    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None

    # Storage
    UPLOAD_DIR: str = "./uploads"

    def get_effective_openrouter_key(self) -> Optional[str]:
        return self.OPENROUTER_API_KEY or os.getenv("OPENROUTER_API_KEY")

    def get_effective_gemini_key(self) -> Optional[str]:
        return self.GEMINI_API_KEY or self.FAST_LLM_API_KEY or os.getenv("GEMINI_API_KEY")

    def get_effective_openai_key(self) -> Optional[str]:
        return self.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")

    def get_effective_anthropic_key(self) -> Optional[str]:
        return self.ANTHROPIC_API_KEY or self.REASONING_LLM_API_KEY or os.getenv("ANTHROPIC_API_KEY")

settings = Settings()
