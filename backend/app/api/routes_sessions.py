from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.core.db import get_db
from app.models.entities import SessionModel, PersonaModel, TurnModel, InterjectionModel, VerdictModel
from app.engine.state import HumanInterjection
import uuid

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

# Active in-memory session state registry
ACTIVE_STATES: Dict[str, Any] = {}

class CreateSessionRequest(BaseModel):
    topic: str
    mode: str = "DEBATE"  # "DEBATE" | "COLLABORATIVE"
    total_rounds: int = 5
    file_name: Optional[str] = None
    file_url: Optional[str] = None

class InterjectRequest(BaseModel):
    content: str
    user_name: str = "Moderator"
    target_persona_id: Optional[str] = None

@router.post("")
async def create_session(req: CreateSessionRequest, db: AsyncSession = Depends(get_db)):
    session = SessionModel(
        id=str(uuid.uuid4()),
        topic=req.topic,
        mode=req.mode,
        total_rounds=req.total_rounds,
        current_round=1,
        status="ACTIVE",
        file_name=req.file_name,
        file_url=req.file_url
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # Sync to MongoDB
    from app.core.mongo import save_session_to_mongo
    save_session_to_mongo({
        "id": session.id,
        "topic": session.topic,
        "mode": session.mode,
        "total_rounds": session.total_rounds,
        "current_round": session.current_round,
        "status": session.status,
        "file_name": session.file_name
    })

    return {
        "id": session.id,
        "topic": session.topic,
        "mode": session.mode,
        "total_rounds": session.total_rounds,
        "current_round": session.current_round,
        "status": session.status,
        "file_name": session.file_name
    }

@router.get("")
async def list_sessions(limit: int = 20, db: AsyncSession = Depends(get_db)):
    stmt = select(SessionModel).order_by(SessionModel.created_at.desc()).limit(limit)
    res = await db.execute(stmt)
    sessions = res.scalars().all()
    return [
        {
            "id": s.id,
            "topic": s.topic,
            "mode": s.mode,
            "status": s.status,
            "total_rounds": s.total_rounds,
            "current_round": s.current_round,
            "created_at": s.created_at.isoformat() if s.created_at else None
        }
        for s in sessions
    ]

@router.get("/{session_id}")
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Personas
    p_stmt = select(PersonaModel).where(PersonaModel.session_id == session_id)
    p_res = await db.execute(p_stmt)
    personas = p_res.scalars().all()

    # Turns
    t_stmt = select(TurnModel).where(TurnModel.session_id == session_id).order_by(TurnModel.created_at.asc())
    t_res = await db.execute(t_stmt)
    turns = t_res.scalars().all()

    # Verdict
    v_stmt = select(VerdictModel).where(VerdictModel.session_id == session_id)
    v_res = await db.execute(v_stmt)
    verdict = v_res.scalar_one_or_none()

    return {
        "id": session.id,
        "topic": session.topic,
        "mode": session.mode,
        "status": session.status,
        "total_rounds": session.total_rounds,
        "current_round": session.current_round,
        "file_name": session.file_name,
        "personas": [
            {
                "id": p.id,
                "identifier": p.identifier,
                "name": p.name,
                "role_title": p.role_title,
                "bias_direction": p.bias_direction,
                "core_worldview": p.core_worldview,
                "avatar_color": p.avatar_color
            }
            for p in personas
        ],
        "turns": [
            {
                "id": t.id,
                "speaker_id": t.persona.identifier if t.persona else "moderator",
                "sender_name": t.persona.name if t.persona else "Moderator",
                "role_title": t.persona.role_title if t.persona else "Human Moderator",
                "round_number": t.round_number,
                "phase": t.phase,
                "content": t.content,
                "citations": t.citations or [],
                "fallacies": t.fallacies or []
            }
            for t in turns
        ],
        "verdict": {
            "winner_identifier": verdict.winner_identifier,
            "scorecard": verdict.scorecard,
            "key_concessions": verdict.key_concessions,
            "unresolved_risks": verdict.unresolved_risks,
            "executive_recommendation": verdict.executive_recommendation,
            "action_plan": verdict.action_plan
        } if verdict else None
    }

@router.post("/{session_id}/interject")
async def interject(session_id: str, req: InterjectRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    interjection = InterjectionModel(
        id=str(uuid.uuid4()),
        session_id=session_id,
        user_name=req.user_name,
        content=req.content,
        target_persona_id=req.target_persona_id,
        applied_to_round=session.current_round
    )
    db.add(interjection)
    await db.commit()

    # Also notify active memory state if running
    if session_id in ACTIVE_STATES:
        state = ACTIVE_STATES[session_id]
        state.pending_interjections.append(HumanInterjection(
            user_name=req.user_name,
            content=req.content,
            target_persona_id=req.target_persona_id
        ))

    return {"status": "injected", "content": req.content}

@router.post("/{session_id}/pause")
async def toggle_pause(session_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    new_status = "PAUSED" if session.status == "ACTIVE" else "ACTIVE"
    session.status = new_status
    await db.commit()
    return {"status": new_status}

class ExtendRequest(BaseModel):
    additional_rounds: int = 1

@router.post("/{session_id}/extend")
async def extend_rounds(session_id: str, req: Optional[ExtendRequest] = None, additional_rounds: Optional[int] = Query(None), db: AsyncSession = Depends(get_db)):
    rounds_to_add = req.additional_rounds if req else (additional_rounds or 1)
    stmt = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Hard cap of maximum 10 rounds as requested
    new_total = min(10, session.total_rounds + rounds_to_add)
    if new_total <= session.total_rounds:
        raise HTTPException(status_code=400, detail="Session is already at the maximum limit of 10 rounds.")

    session.total_rounds = new_total
    session.status = "ACTIVE"

    # If it was completed, remove old verdict row so judge re-evaluates all turns at the end
    v_stmt = select(VerdictModel).where(VerdictModel.session_id == session_id)
    v_res = await db.execute(v_stmt)
    old_verdict = v_res.scalar_one_or_none()
    if old_verdict:
        await db.delete(old_verdict)

    await db.commit()
    await db.refresh(session)

    # Update active in-memory state
    if session_id in ACTIVE_STATES:
        ACTIVE_STATES[session_id].total_rounds = new_total
        ACTIVE_STATES[session_id].is_completed = False
        ACTIVE_STATES[session_id].verdict = None

    # Sync to MongoDB
    from app.core.mongo import save_session_to_mongo
    save_session_to_mongo({
        "id": session.id,
        "topic": session.topic,
        "mode": session.mode,
        "total_rounds": session.total_rounds,
        "current_round": session.current_round,
        "status": session.status,
        "file_name": session.file_name
    })

    return {
        "id": session.id,
        "status": session.status,
        "current_round": session.current_round,
        "total_rounds": session.total_rounds
    }

@router.delete("/{session_id}")
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    ACTIVE_STATES.pop(session_id, None)

    # Delete from SQLite (cascades to turns, personas, etc.)
    await db.delete(session)
    await db.commit()

    # Delete from MongoDB
    from app.core.mongo import delete_session_from_mongo
    delete_session_from_mongo(session_id)

    return {"status": "deleted", "id": session_id}
