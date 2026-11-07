from langgraph.graph import StateGraph, END
from app.engine.state import DebateState
from app.engine.nodes.synthesizer import synthesize_personas_node
from app.engine.nodes.debater import debater_turn_node
from app.engine.nodes.referee import referee_audit_node
from app.engine.nodes.interjection import apply_interjections_node
from app.engine.nodes.judge import judge_adjudication_node

def route_next_step(state: DebateState) -> str:
    # Check if completed or reached total rounds
    if state.is_completed or (state.current_round > state.total_rounds):
        return "judge"
    if len(state.pending_interjections) > 0:
        return "apply_interjections"
    return "debater"

def build_debate_graph():
    workflow = StateGraph(DebateState)

    workflow.add_node("synthesizer", synthesize_personas_node)
    workflow.add_node("debater", debater_turn_node)
    workflow.add_node("referee", referee_audit_node)
    workflow.add_node("apply_interjections", apply_interjections_node)
    workflow.add_node("judge", judge_adjudication_node)

    # Initial flow
    workflow.set_entry_point("synthesizer")
    workflow.add_edge("synthesizer", "debater")
    workflow.add_edge("debater", "referee")
    
    # Cyclic router
    workflow.add_conditional_edges(
        "referee",
        route_next_step,
        {
            "debater": "debater",
            "apply_interjections": "apply_interjections",
            "judge": "judge"
        }
    )
    workflow.add_edge("apply_interjections", "debater")
    workflow.add_edge("judge", END)

    return workflow.compile()
