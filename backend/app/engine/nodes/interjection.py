import uuid
from app.engine.state import DebateState, MessageTurn

async def apply_interjections_node(state: DebateState) -> DebateState:
    while state.pending_interjections:
        interjection = state.pending_interjections.pop(0)
        
        # Insert a special moderator turn into transcript
        moderator_turn = MessageTurn(
            id=str(uuid.uuid4()),
            speaker_id="moderator",
            sender_name=interjection.user_name,
            role_title="Human Moderator",
            round_number=state.current_round,
            phase="INTERJECTION",
            content=f"⚠️ MODERATOR CONSTRAINT INJECTED: \"{interjection.content}\". Both participants must incorporate this requirement immediately.",
            citations=[],
            fallacies=[]
        )
        state.turns.append(moderator_turn)
        
    return state
