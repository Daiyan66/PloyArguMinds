from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio
import json
import uuid

from app.core.db import AsyncSessionLocal
from app.models.entities import SessionModel, PersonaModel, TurnModel, VerdictModel, DocumentChunkModel
from app.engine.state import DebateState, Persona as StatePersona, MessageTurn, FallacyAlert, Citation
from app.engine.nodes.synthesizer import synthesize_personas_node
from app.engine.nodes.debater import debater_turn_node
from app.engine.nodes.referee import referee_audit_node
from app.engine.nodes.interjection import apply_interjections_node
from app.engine.nodes.judge import judge_adjudication_node
from app.api.routes_sessions import ACTIVE_STATES

router = APIRouter(prefix="/api/sessions", tags=["streaming"])

async def load_or_init_state(session_id: str, db: AsyncSession) -> DebateState:
    if session_id in ACTIVE_STATES:
        return ACTIVE_STATES[session_id]

    stmt = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.execute(stmt)
    sess = res.scalar_one_or_none()
    if not sess:
        raise ValueError(f"Session {session_id} not found")

    # Document context if any
    doc_stmt = select(DocumentChunkModel).where(DocumentChunkModel.session_id == session_id)
    doc_res = await db.execute(doc_stmt)
    chunks = doc_res.scalars().all()
    doc_context = "\n".join([f"[{c.file_name} p.{c.page_number}]: {c.content}" for c in chunks]) if chunks else None

    # Personas
    p_stmt = select(PersonaModel).where(PersonaModel.session_id == session_id)
    p_res = await db.execute(p_stmt)
    personas_db = p_res.scalars().all()

    personas = [
        StatePersona(
            id=p.id,
            identifier=p.identifier,
            name=p.name,
            role_title=p.role_title,
            bias_direction=p.bias_direction,
            core_worldview=p.core_worldview,
            system_prompt=p.system_prompt,
            avatar_color=p.avatar_color
        )
        for p in personas_db
    ]

    # Turns
    t_stmt = select(TurnModel).where(TurnModel.session_id == session_id).order_by(TurnModel.created_at.asc())
    t_res = await db.execute(t_stmt)
    turns_db = t_res.scalars().all()

    turns = [
        MessageTurn(
            id=t.id,
            speaker_id=t.persona.identifier if t.persona else "moderator",
            sender_name=t.persona.name if t.persona else "Moderator",
            role_title=t.persona.role_title if t.persona else "Human Moderator",
            round_number=t.round_number,
            phase=t.phase,
            content=t.content,
            citations=[Citation(**c) for c in (t.citations or [])],
            fallacies=[FallacyAlert(**f) for f in (t.fallacies or [])]
        )
        for t in turns_db
    ]

    # Verdict
    v_stmt = select(VerdictModel).where(VerdictModel.session_id == session_id)
    v_res = await db.execute(v_stmt)
    verdict_db = v_res.scalar_one_or_none()
    verdict_dict = None
    if verdict_db:
        verdict_dict = {
            "winner_identifier": verdict_db.winner_identifier,
            "scorecard": verdict_db.scorecard,
            "key_concessions": verdict_db.key_concessions,
            "unresolved_risks": verdict_db.unresolved_risks,
            "executive_recommendation": verdict_db.executive_recommendation,
            "action_plan": verdict_db.action_plan
        }

    state = DebateState(
        session_id=session_id,
        topic=sess.topic,
        mode=sess.mode,
        document_context=doc_context,
        personas=personas,
        turns=turns,
        current_round=sess.current_round,
        total_rounds=sess.total_rounds,
        active_persona_idx=len([t for t in turns if t.speaker_id != "moderator"]),
        is_completed=(sess.status == "COMPLETED" or verdict_dict is not None),
        verdict=verdict_dict
    )
    ACTIVE_STATES[session_id] = state
    return state


@router.get("/{session_id}/stream")
async def stream_debate(session_id: str):
    async def event_generator():
        async with AsyncSessionLocal() as db:
            try:
                state = await load_or_init_state(session_id, db)
            except Exception as e:
                yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
                return

            # 1. Synthesize Personas if not yet created
            if not state.personas:
                yield f"event: status\ndata: {json.dumps({'message': 'Synthesizing domain expert personas...'})}\n\n"
                state = await synthesize_personas_node(state)
                # Save to DB
                for p in state.personas:
                    p_model = PersonaModel(
                        id=p.id,
                        session_id=session_id,
                        identifier=p.identifier,
                        name=p.name,
                        role_title=p.role_title,
                        bias_direction=p.bias_direction,
                        core_worldview=p.core_worldview,
                        system_prompt=p.system_prompt,
                        avatar_color=p.avatar_color
                    )
                    db.add(p_model)
                await db.commit()

            # Emit Personas Ready
            yield f"event: personas_ready\ndata: {json.dumps([p.dict() for p in state.personas])}\n\n"

            # If already completed, replay existing turns and emit verdict
            if state.is_completed and state.verdict:
                for t in state.turns:
                    yield f"event: turn_start\ndata: {json.dumps({'speaker_id': t.speaker_id, 'name': t.sender_name, 'round': t.round_number, 'phase': t.phase})}\n\n"
                    yield f"event: token\ndata: {json.dumps({'token': t.content})}\n\n"
                    for f in t.fallacies:
                        yield f"event: fallacy_alert\ndata: {json.dumps(f.dict())}\n\n"
                    yield f"event: turn_end\ndata: {json.dumps({'turn_id': t.id, 'citations': [c.dict() for c in t.citations]})}\n\n"
                yield f"event: verdict_ready\ndata: {json.dumps(state.verdict)}\n\n"
                return

            # Replay any existing past turns for newly connected client
            for t in state.turns:
                yield f"event: turn_start\ndata: {json.dumps({'speaker_id': t.speaker_id, 'name': t.sender_name, 'round': t.round_number, 'phase': t.phase})}\n\n"
                yield f"event: token\ndata: {json.dumps({'token': t.content})}\n\n"
                for f in t.fallacies:
                    yield f"event: fallacy_alert\ndata: {json.dumps(f.dict())}\n\n"
                yield f"event: turn_end\ndata: {json.dumps({'turn_id': t.id, 'citations': [c.dict() for c in t.citations]})}\n\n"

            try:
                # 2. Main Dialectic Loop
                while not state.is_completed and state.current_round <= state.total_rounds:
                    # Check for user interjections first
                    if state.pending_interjections:
                        yield f"event: status\ndata: {json.dumps({'message': 'Applying human constraint steering...'})}\n\n"
                        turns_before = len(state.turns)
                        state = await apply_interjections_node(state)
                        # Persist interjection turns
                        for new_t in state.turns[turns_before:]:
                            t_model = TurnModel(
                                id=new_t.id,
                                session_id=session_id,
                                persona_id=None,
                                round_number=new_t.round_number,
                                phase=new_t.phase,
                                content=new_t.content,
                                citations=[],
                                fallacies=[]
                            )
                            db.add(t_model)
                            yield f"event: turn_start\ndata: {json.dumps({'speaker_id': new_t.speaker_id, 'name': new_t.sender_name, 'round': new_t.round_number, 'phase': new_t.phase})}\n\n"
                            yield f"event: token\ndata: {json.dumps({'token': new_t.content})}\n\n"
                            yield f"event: turn_end\ndata: {json.dumps({'turn_id': new_t.id})}\n\n"
                        await db.commit()
                        await asyncio.sleep(0.5)

                    active_persona = state.personas[state.active_persona_idx % len(state.personas)]
                    
                    # Signal Turn Start
                    yield f"event: turn_start\ndata: {json.dumps({'speaker_id': active_persona.identifier, 'name': active_persona.name, 'round': state.current_round, 'phase': 'THINKING'})}\n\n"

                    # Generate Debater Turn
                    turn_count_before = len(state.turns)
                    state = await debater_turn_node(state, db_session=db)
                    turn = state.turns[-1]

                    # Stream content in word/token chunks
                    words = turn.content.split(" ")
                    for i, word in enumerate(words):
                        chunk = word + (" " if i < len(words) - 1 else "")
                        yield f"event: token\ndata: {json.dumps({'token': chunk})}\n\n"
                        await asyncio.sleep(0.02)

                    # 3. Real-Time Fallacy Audit
                    try:
                        state = await referee_audit_node(state)
                        turn = state.turns[-1]
                        if turn.fallacies:
                            for f in turn.fallacies:
                                yield f"event: fallacy_alert\ndata: {json.dumps(f.dict())}\n\n"
                    except Exception as ref_err:
                        print(f"Referee audit non-blocking warning: {ref_err}")

                    # Persist Turn to DB
                    # Lookup persona db id
                    p_id = next((p.id for p in state.personas if p.identifier == turn.speaker_id), None)
                    t_model = TurnModel(
                        id=turn.id,
                        session_id=session_id,
                        persona_id=p_id,
                        round_number=turn.round_number,
                        phase=turn.phase,
                        content=turn.content,
                        citations=[c.dict() for c in turn.citations],
                        fallacies=[f.dict() for f in turn.fallacies]
                    )
                    db.add(t_model)

                    # Sync turn to MongoDB
                    try:
                        from app.core.mongo import save_turn_to_mongo
                        save_turn_to_mongo(session_id, {
                            "id": turn.id,
                            "speaker_id": turn.speaker_id,
                            "sender_name": turn.sender_name,
                            "role_title": turn.role_title,
                            "round_number": turn.round_number,
                            "phase": turn.phase,
                            "content": turn.content,
                            "citations": [c.dict() for c in turn.citations],
                            "fallacies": [f.dict() for f in turn.fallacies]
                        })
                    except Exception as m_err:
                        print(f"Mongo sync non-blocking warning: {m_err}")

                    # Update session current round
                    sess_stmt = select(SessionModel).where(SessionModel.id == session_id)
                    sess_res = await db.execute(sess_stmt)
                    db_sess = sess_res.scalar_one_or_none()
                    if db_sess:
                        db_sess.current_round = state.current_round
                    await db.commit()

                    # Turn End Event
                    yield f"event: turn_end\ndata: {json.dumps({'turn_id': turn.id, 'citations': [c.dict() for c in turn.citations]})}\n\n"

                    # Brief organic pause between turns
                    await asyncio.sleep(0.8)

                # 4. Chief Adjudication & Decision Memo
                if not state.verdict:
                    yield f"event: status\ndata: {json.dumps({'message': 'Chief Arbiter evaluating dialectic matrix & generating Decision Memo...'})}\n\n"
                    state = await judge_adjudication_node(state)
                    
                    v_model = VerdictModel(
                        id=str(uuid.uuid4()),
                        session_id=session_id,
                        winner_identifier=state.verdict.get("winner_identifier"),
                        scorecard=state.verdict.get("scorecard", {}),
                        key_concessions=state.verdict.get("key_concessions", []),
                        unresolved_risks=state.verdict.get("unresolved_risks", []),
                        executive_recommendation=state.verdict.get("executive_recommendation", ""),
                        action_plan=state.verdict.get("action_plan", [])
                    )
                    db.add(v_model)

                    # Sync verdict to MongoDB
                    try:
                        from app.core.mongo import save_verdict_to_mongo
                        save_verdict_to_mongo(session_id, {
                            "winner_identifier": state.verdict.get("winner_identifier"),
                            "scorecard": state.verdict.get("scorecard", {}),
                            "key_concessions": state.verdict.get("key_concessions", []),
                            "unresolved_risks": state.verdict.get("unresolved_risks", []),
                            "executive_recommendation": state.verdict.get("executive_recommendation", ""),
                            "action_plan": state.verdict.get("action_plan", [])
                        })
                    except Exception as m_err:
                        print(f"Mongo verdict non-blocking warning: {m_err}")

                    # Update session status
                    sess_stmt = select(SessionModel).where(SessionModel.id == session_id)
                    sess_res = await db.execute(sess_stmt)
                    db_sess = sess_res.scalar_one_or_none()
                    if db_sess:
                        db_sess.status = "COMPLETED"
                    await db.commit()

                yield f"event: verdict_ready\ndata: {json.dumps(state.verdict)}\n\n"

            except Exception as stream_err:
                import traceback
                traceback.print_exc()
                yield f"event: error\ndata: {json.dumps({'error': str(stream_err)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
