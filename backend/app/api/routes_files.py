import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_db
from app.core.config import settings
from app.models.entities import SessionModel, DocumentChunkModel
from app.engine.tools.rag_search import generate_embedding

router = APIRouter(prefix="/api/files", tags=["files"])

def extract_text_from_pdf(file_bytes: bytes) -> list[dict]:
    pages_content = []
    try:
        import pypdf
        import io
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                pages_content.append({"page": i + 1, "text": text.strip()})
    except Exception as e:
        print(f"pypdf extraction failed: {e}")
        # fallback simple decode
        try:
            raw_text = file_bytes.decode('utf-8', errors='ignore')
            pages_content.append({"page": 1, "text": raw_text})
        except Exception:
            pass
    return pages_content

def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
        i += (chunk_size - overlap)
    return chunks

@router.post("/upload")
async def upload_document(
    session_id: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    content = await file.read()
    filename = file.filename or "uploaded_document.pdf"
    
    # Save file to disk
    file_path = os.path.join(settings.UPLOAD_DIR, f"{session_id}_{filename}")
    with open(file_path, "wb") as f:
        f.write(content)

    pages = []
    if filename.lower().endswith(".pdf"):
        pages = extract_text_from_pdf(content)
    else:
        text = content.decode("utf-8", errors="ignore")
        pages = [{"page": 1, "text": text}]

    chunk_models = []
    global_chunk_idx = 0

    for p in pages:
        text_chunks = chunk_text(p["text"])
        for chunk_str in text_chunks:
            emb = await generate_embedding(chunk_str)
            chunk_m = DocumentChunkModel(
                id=str(uuid.uuid4()),
                session_id=session_id,
                file_name=filename,
                page_number=p["page"],
                chunk_index=global_chunk_idx,
                content=chunk_str,
                embedding=emb
            )
            chunk_models.append(chunk_m)
            global_chunk_idx += 1

    if chunk_models:
        db.add_all(chunk_models)
        session.file_name = filename
        session.file_url = f"/uploads/{session_id}_{filename}"
        await db.commit()

    return {
        "status": "success",
        "file_name": filename,
        "chunks_indexed": len(chunk_models),
        "pages_processed": len(pages)
    }
