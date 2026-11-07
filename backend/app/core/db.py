from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings
import os

# Ensure upload and local directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Select database URL
db_url = settings.POSTGRES_DATABASE_URL or settings.DATABASE_URL

# For postgres URL compatibility with asyncpg
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    db_url,
    echo=False,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        # If postgres, enable vector extension if available
        if "postgresql" in db_url:
            try:
                from sqlalchemy import text
                await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
                await conn.execute(text('CREATE EXTENSION IF NOT EXISTS vector;'))
            except Exception as e:
                print(f"Postgres extensions warning: {e}")
        await conn.run_sync(Base.metadata.create_all)
