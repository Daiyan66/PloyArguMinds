from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

from app.core.db import get_db
from app.models.entities import UserModel
from app.core.mongo import save_user_to_mongo

router = APIRouter(prefix="/api/users", tags=["users"])

class GoogleUserSyncRequest(BaseModel):
    email: str
    name: str
    avatar: Optional[str] = None
    google_id: Optional[str] = None
    role: Optional[str] = "Executive Decision Arbiter"

@router.post("/sync")
async def sync_google_user(req: GoogleUserSyncRequest, db: AsyncSession = Depends(get_db)):
    """
    Sync or auto-create a user when logging in via Google account.
    Guarantees user account exists in Supabase PostgreSQL and MongoDB.
    """
    clean_email = req.email.strip().lower()
    
    # 1. Check if user already exists by email
    stmt = select(UserModel).where(UserModel.email == clean_email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    is_new = False
    if user:
        # Existing user - update profile info if changed
        if req.name and req.name.strip():
            user.name = req.name.strip()
        if req.avatar:
            user.avatar = req.avatar
        if req.google_id and not user.google_id:
            user.google_id = req.google_id
        user.updated_at = datetime.utcnow()
    else:
        # First time login - auto-create user record
        is_new = True
        user = UserModel(
            id=f"usr_{uuid.uuid4().hex[:12]}",
            email=clean_email,
            name=req.name.strip() if req.name else clean_email.split('@')[0],
            avatar=req.avatar,
            google_id=req.google_id,
            role=req.role or "Executive Decision Arbiter",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    # 2. Sync to MongoDB users collection
    user_payload = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "avatar": user.avatar,
        "google_id": user.google_id,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }
    save_user_to_mongo(user_payload)

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "avatar": user.avatar,
        "google_id": user.google_id,
        "role": user.role,
        "is_new": is_new
    }

@router.get("/{user_id}")
async def get_user_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(UserModel).where((UserModel.id == user_id) | (UserModel.email == user_id.lower()))
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "avatar": user.avatar,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }
