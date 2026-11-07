import pytest
from app.engine.state import DebateState, HumanInterjection
from app.engine.nodes.synthesizer import synthesize_personas_node
from app.engine.nodes.debater import debater_turn_node
from app.engine.nodes.referee import referee_audit_node
from app.engine.nodes.interjection import apply_interjections_node
from app.engine.nodes.judge import judge_adjudication_node
from app.engine.llm_factory import MockLLM

@pytest.mark.asyncio
async def test_full_dialectic_flow():
    mock_llm = MockLLM()
    state = DebateState(
        session_id="test-session-123",
        topic="Migrate monolithic backend to microservices on Kubernetes",
        total_rounds=2
    )

    # 1. Synthesize personas
    state = await synthesize_personas_node(state, llm=mock_llm)
    assert len(state.personas) == 2
    assert state.personas[0].identifier == "agent_a"
    assert state.personas[1].identifier == "agent_b"

    # 2. Debater Turn 1 (Agent A)
    state = await debater_turn_node(state, llm=mock_llm)
    assert len(state.turns) == 1
    assert state.turns[0].speaker_id == "agent_a"
    assert state.turns[0].phase == "FOUNDATION"

    # 3. Debater Turn 2 (Agent B)
    state = await debater_turn_node(state, llm=mock_llm)
    assert len(state.turns) == 2
    assert state.turns[1].speaker_id == "agent_b"

    # 4. Referee Audit
    state = await referee_audit_node(state, fast_llm=mock_llm)
    assert len(state.turns) == 2

    # 5. Human Interjection
    state.pending_interjections.append(HumanInterjection(
        user_name="CTO",
        content="We must cap cloud migration budget at 10% increase."
    ))
    state = await apply_interjections_node(state)
    assert len(state.turns) == 3
    assert state.turns[2].speaker_id == "moderator"
    assert "capping" in state.turns[2].content.lower() or "budget" in state.turns[2].content.lower()

    # 6. Judge Adjudication
    state = await judge_adjudication_node(state, frontier_llm=mock_llm)
    assert state.is_completed is True
    assert state.verdict is not None
    assert "scorecard" in state.verdict
    assert "executive_recommendation" in state.verdict
