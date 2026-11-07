import uuid
from typing import Tuple
from langchain_core.messages import SystemMessage, HumanMessage
from app.engine.state import DebateState, MessageTurn, Citation
from app.engine.tools.rag_search import retrieve_semantic_context

def determine_round_agenda(current_round: int, total_rounds: int, mode: str = "DEBATE") -> Tuple[str, str, str]:
    mode_tone = (
        "DIALECTIC POSTURE: Rigorous Red-Team stress-testing. Aggressively test assumptions, expose operational blind spots, and demand empirical evidence."
        if mode == "DEBATE"
        else "DIALECTIC POSTURE: Collaborative Design Review. Seek pragmatic synthesis, balance competing architectural priorities, and converge on derisked solutions."
    )

    # 4-stage or 5-stage progressive aspect breakdown
    if total_rounds == 1:
        aspect = "Comprehensive Core Assessment & Trade-off Triage"
        phase = "FOUNDATION"
        details = (
            "Evaluate the immediate viability, first principles, and critical operational constraints of this proposal."
        )
    elif total_rounds == 2:
        if current_round == 1:
            aspect = "Foundational Architecture & Core Mechanics"
            phase = "FOUNDATION"
            details = (
                "Focus exclusively on first-principles architecture, technical mechanisms, and immediate feasibility. "
                "Do NOT jump to financial TCO or hiring yet; reserve those for Round 2."
            )
        else:
            aspect = "Total Cost of Ownership & Final Convergence"
            phase = "CLASH"
            details = (
                "Focus on long-term infrastructure spend, operational resilience, and the final policy consensus."
            )
    elif total_rounds == 3:
        if current_round == 1:
            aspect = "Core Architecture & Performance Premise"
            phase = "FOUNDATION"
            details = (
                "Evaluate the foundational premise, throughput/latency claims, and mechanism design. "
                "Do NOT dilute your argument by jumping to team velocity or licensing budgets yet."
            )
        elif current_round == 2:
            aspect = "Developer Velocity & Operational Friction"
            phase = "EVIDENCE"
            details = (
                "Scrutinize team onboarding curves, day-to-day workflow friction, deployment complexity, and production telemetry."
            )
        else:
            aspect = "Financial TCO & Executive Verdict"
            phase = "CLASH"
            details = (
                "Analyze infrastructure spend, organizational risk blast-radius, and establish your definitive strategic recommendation."
            )
    elif total_rounds == 4:
        if current_round == 1:
            aspect = "Core Architecture & Performance Topology"
            phase = "FOUNDATION"
            details = (
                "Examine the core technical architecture, raw benchmark claims, and structural design. "
                "Do NOT jump ahead to hiring or budgets; focus strictly on technical soundness and structural validity."
            )
        elif current_round == 2:
            aspect = "Developer Velocity & Tooling Ergonomics"
            phase = "EVIDENCE"
            details = (
                "Scrutinize day-to-day developer productivity, tooling ecosystem maturity, learning curve friction, and sprint velocity impacts."
            )
        elif current_round == 3:
            aspect = "Production Reliability, Edge Cases & Security"
            phase = "SCRUTINY"
            details = (
                "Evaluate operational failure modes, blast radius containment, observability, memory/state safety, and incident recovery."
            )
        else:
            aspect = "Financial TCO, Talent Market & Policy Verdict"
            phase = "CLASH"
            details = (
                "Analyze CapEx/OpEx, hiring pipeline liquidity, long-term technical debt, and deliver a definitive policy verdict."
            )
    else: # 5 to 10 rounds
        progress = current_round / max(total_rounds, 1)
        if current_round == 1:
            aspect = "Foundational Architecture & First Principles"
            phase = "FOUNDATION"
            details = "Establish the core architectural premise and definition boundaries. Keep other topics for subsequent rounds."
        elif current_round == 2:
            aspect = "Developer Velocity & Implementation Friction"
            phase = "EVIDENCE"
            details = "Assess implementation complexity, learning curve, and impact on team delivery cycles."
        elif current_round == 3:
            aspect = "Production Resilience & Failure Domains"
            phase = "SCRUTINY"
            details = "Examine catastrophic edge cases, disaster recovery, security posture, and runtime observability."
        elif current_round == 4:
            aspect = "Financial TCO & Talent Ecosystem"
            phase = "EVIDENCE"
            details = "Scrutinize direct cloud infrastructure costs, license fees, hiring constraints, and contractor dependence."
        elif progress < 0.9:
            aspect = f"Deep Dive: Operational Stress-Testing (Part {current_round - 4})"
            phase = "CLASH"
            details = "Address cross-cutting organizational friction, backward compatibility, and compliance mandates."
        else:
            aspect = "Strategic Trade-Off Synthesis & Final Policy Verdict"
            phase = "CONVERGENCE"
            details = "Synthesize all preceding rounds and deliver your unyielding strategic bottom line."

    instruction = (
        f"{mode_tone}\n"
        f"ROUND {current_round} OF {total_rounds} SPECIFIC FOCUS: [{aspect.upper()}]\n"
        f"{details}\n\n"
        f"*** MANDATORY ROUND FOCUS CONSTRAINT ***\n"
        f"You are strictly designated to debate/review ONLY the [{aspect}] dimension in this round. "
        f"DO NOT deliver a generic macro summary of the whole proposal. "
        f"DO NOT jump ahead into dimensions reserved for other rounds. "
        f"Provide deep, highly specific, and granular arguments on this specific topic pillar only."
    )

    return phase, aspect, instruction

async def debater_turn_node(state: DebateState, llm=None, db_session=None) -> DebateState:
    if llm is None:
        from app.engine.llm_factory import get_llm
        llm = get_llm("fast")

    if not state.personas:
        # Emergency fallback if synthesize wasn't run
        from app.engine.nodes.synthesizer import synthesize_personas_node
        await synthesize_personas_node(state, llm)

    active_persona = state.personas[state.active_persona_idx % len(state.personas)]
    phase_name, aspect_title, round_instruction = determine_round_agenda(state.current_round, state.total_rounds, state.mode)

    # 1. Retrieve RAG grounding chunks if document or db is active
    rag_context = ""
    citations = []
    if db_session and state.session_id:
        query = f"{state.topic} {aspect_title}"
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
        f"[{t.role_title} - {t.sender_name} (Round {t.round_number} - {t.phase})]:\n{t.content}"
        for t in state.turns[-4:]
    )

    format_instruction = (
        "\n### RESPONSE FORMAT INSTRUCTIONS ###\n"
        "Deliver a complete, high-caliber executive statement (250-350 words). NEVER end mid-sentence.\n"
        f"Focus specifically on the assigned aspect: **{aspect_title}**.\n"
        "Use this clean markdown structure:\n"
        f"**Core Stance on {aspect_title}:** (Direct position on this round's specific aspect)\n\n"
        "**Key Argument & Evidence:** (Empirical reasoning, concrete trade-offs, metrics, and precedents)\n\n"
        "**Rebuttal / Scrutiny:** (Direct response addressing the peer's statements or challenges)\n\n"
        "**Bottom Line:** (Clear, concise takeaway for this dimension)"
    )

    full_system = f"{active_persona.system_prompt}\n\n{round_instruction}\n{format_instruction}\n{rag_context}"
    user_prompt = (
        f"TOPIC: {state.topic}\n"
        f"MODE: {state.mode}\n"
        f"CURRENT ROUND: {state.current_round} of {state.total_rounds}\n"
        f"ASSIGNED ROUND FOCUS: {aspect_title}\n\n"
        f"RECENT DIALECTIC HISTORY:\n{recent_history or 'Opening statement for round 1.'}\n\n"
        "YOUR TARGETED RESPONSE:"
    )

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
        phase=aspect_title,
        content=response.content,
        citations=citations,
        fallacies=[]
    )

    state.turns.append(new_turn)
    state.active_persona_idx += 1
    if state.active_persona_idx % len(state.personas) == 0:
        state.current_round += 1

    return state
