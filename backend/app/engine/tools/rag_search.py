import math
import re
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from app.core.config import settings
from app.models.entities import DocumentChunkModel

def simple_embed(text: str, dim: int = 64) -> List[float]:
    """Lightweight deterministic embedding for fallback vector search when API keys are absent."""
    words = re.findall(r'\w+', text.lower())
    vec = [0.0] * dim
    if not words:
        return vec
    for i, w in enumerate(words):
        h = hash(w) % dim
        vec[h] += 1.0 / (1.0 + math.log(1 + i))
    # Normalize
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [x / norm for x in vec]

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)

async def generate_embedding(text_content: str) -> List[float]:
    openai_key = settings.get_effective_openai_key()
    if openai_key:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=openai_key)
            resp = await client.embeddings.create(
                model="text-embedding-3-small",
                input=text_content
            )
            return resp.data[0].embedding
        except Exception as e:
            print(f"OpenAI embedding failed, falling back: {e}")

    # Fallback deterministic vector
    return simple_embed(text_content)

async def retrieve_semantic_context(session_id: str, query: str, db_session, top_k: int = 3) -> List[Dict[str, Any]]:
    """Retrieve top-k relevant document chunks for the session."""
    query_vector = await generate_embedding(query)
    
    stmt = select(DocumentChunkModel).where(DocumentChunkModel.session_id == session_id)
    result = await db_session.execute(stmt)
    chunks: List[DocumentChunkModel] = result.scalars().all()

    if not chunks:
        return []

    scored_chunks = []
    for c in chunks:
        sim = 0.0
        if c.embedding:
            # If stored as JSON list
            sim = cosine_similarity(query_vector, c.embedding)
        scored_chunks.append({
            "file_name": c.file_name,
            "page_number": c.page_number,
            "content": c.content,
            "similarity": sim
        })

    scored_chunks.sort(key=lambda x: x["similarity"], reverse=True)
    return scored_chunks[:top_k]
