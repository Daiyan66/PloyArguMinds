import uuid
from typing import Tuple
from langchain_core.messages import SystemMessage, HumanMessage
from app.engine.state import DebateState, MessageTurn, Citation
from app.engine.tools.rag_search import retrieve_semantic_context

def determine_phase_prompt(current_round: int, total_rounds: int, mode: str = "DEBATE") -> Tuple[str, str]:
    mode_tone = (
        "DIALECTIC POSTURE: Rigorous Red-Team stress-testing. Aggressively test assumptions, expose operational blind spots, and demand empirical evidence."
        if mode == "DEBATE"
        else "DIALECTIC POSTURE: Collaborative Design Review. Seek pragmatic synthesis, balance competing architectural priorities, and converge on derisked solutions."
    )

    if current_round == 1:
        return (
            "FOUNDATION",
            f"{mode_tone}\n"
            "PHASE: FOUNDATION. Clearly define boundary conditions, definitions, and primary thesis. "
            "Establish the foundational ethical, technical, or financial premise without hand-waving."
        )
    progress = current_round / max(total_rounds, 1)
    if progress <= 0.67:
        return (
            "EVIDENCE",
            f"{mode_tone}\n"
            "PHASE: EVIDENCE & SCRUTINY. Back your claims with concrete empirical precedent, "
            "industry benchmarks, latency/cost metrics, or context data. Challenge vague rhetoric."
        )
    else:
        return (
            "CLASH",
            f"{mode_tone}\n"
            "PHASE: DIRECT CLASH & CONVERGENCE. Directly dismantle the opponent's counterarguments. "
            "Expose flaws in their assumptions, address trade-offs, and state your final definitive position."
        )

async def debater_turn_node(state: DebateState, llm=None, db_session=None) -> DebateState:
    if llm is None:
        from app.engine.llm_factory import get_llm
        llm = get_llm("fast")

    if not state.personas:
        # Emergency fallback if synthesize wasn't run
        from app.engine.nodes.synthesizer import synthesize_personas_node
        await synthesize_personas_node(state, llm)

    active_persona = state.personas[state.active_persona_idx % len(state.personas)]
    phase_name, phase_instruction = determine_phase_prompt(state.current_round, state.total_rounds, state.mode)

    # 1. Retrieve RAG grounding chunks if document or db is active
    rag_context = ""
    citations = []
    if db_session and state.session_id:
        query = state.turns[-1].content if state.turns else state.topic
        chunks = await retrieve_semantic_context(state.session_id, query, db_session, top_k=2)
        if chunks:
            rag_context = "\n### RELEVANT DOCUMENT CONTEXT ###\n" + "\n".join(
                f"[Source: {c['file_name']}, Page {c['page_number']}]: {c['content']}" for c in chunks
            )
            for c in chunks:
                citations.append(Citation(
                    source_title=c['file_name'],
                    page_number=c['page_number'],
                    snippet=c['content'][:140] + "..." if len(c['content']) > 140 else c['content']
                ))

    # 2. Build Sliding Conversation Window (last 4 turns)
    recent_history = "\n\n".join(
        f"[{t.role_title} - {t.sender_name}]:\n{t.content}"
        for t in state.turns[-4:]
    )

    format_instruction = (
        "\n### RESPONSE FORMAT INSTRUCTIONS ###\n"
        "Deliver a complete, high-caliber executive statement (250-350 words). NEVER end mid-sentence.\n"
        "Use this clean markdown structure:\n"
        "**Core Stance:** (Direct opening position on this turn)\n\n"
        "**Key Argument & Evidence:** (Empirical reasoning, concrete trade-offs, metrics, and precedents)\n\n"
        "**Rebuttal / Scrutiny:** (Direct response addressing the opponent's statements or challenges)\n\n"
        "**Bottom Line:** (Clear, concise takeaway for leadership)"
    )

    full_system = f"{active_persona.system_prompt}\n\n{phase_instruction}\n{format_instruction}\n{rag_context}"
    user_prompt = f"TOPIC: {state.topic}\nMODE: {state.mode}\nROUND: {state.current_round} of {state.total_rounds}\n\nRECENT DIALECTIC HISTORY:\n{recent_history or 'Opening statement for round 1.'}\n\nYOUR RESPONSE:"

    response = await llm.ainvoke([
        SystemMessage(content=full_system),
        HumanMessage(content=user_prompt)
    ])

    new_turn = MessageTurn(
        id=str(uuid.uuid4()),
        speaker_id=active_persona.identifier,
        sender_name=active_persona.name,
        role_title=active_persona.role_title,
        round_number=state.current_round,
        phase=phase_name,
        content=response.content,
        citations=citations,
        fallacies=[]
    )

    state.turns.append(new_turn)
    state.active_persona_idx += 1
    if state.active_persona_idx % len(state.personas) == 0:
        state.current_round += 1

    return state
