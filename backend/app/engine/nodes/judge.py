import json
import re
from langchain_core.messages import SystemMessage, HumanMessage
from app.engine.state import DebateState

JUDGE_PROMPT = """
You are the Chief Adjudicator and Senior Strategic Decision Arbiter.
Review the complete dialectic exchange below.
Your objective is NOT to declare a shallow winner, but to deliver an Executive Decision Memo that derisks this topic.

Follow this strict rubric:
1. SCORING MATRIX (0.0 to 10.0 for each debater):
   - Logical Rigor (consistency, deductive validity, avoidance of fallacies)
   - Evidence Grounding (factual verifiability, use of citations/context)
   - Rebuttal Directness (ability to dismantle the opponent's core points)
2. KEY CONCESSIONS: List points where either side legitimately conceded ground.
3. UNRESOLVED BLIND SPOTS: Critical failure modes or edge-cases neither party addressed.
4. EXECUTIVE RECOMMENDATION: Deliver an unambiguous strategic verdict:
   (e.g., 'PROCEED WITH CONDITIONAL PILOT', 'REJECT PROPOSAL', 'HYBRID STAGED ROLLOUT').
5. ACTION PLAN: 3 to 5 prioritized, concrete next steps.

Output strictly valid JSON with this schema:
{
  "winner_identifier": "agent_a | agent_b | TIE",
  "scorecard": {
    "agent_a": { "logical_rigor": 8.5, "evidence_grounding": 9.0, "rebuttal_directness": 8.0, "total": 8.5 },
    "agent_b": { "logical_rigor": 7.0, "evidence_grounding": 6.5, "rebuttal_directness": 8.5, "total": 7.3 }
  },
  "key_concessions": ["..."],
  "unresolved_risks": ["..."],
  "executive_recommendation": "...",
  "action_plan": ["Step 1", "Step 2", "Step 3"]
}
"""

def extract_json(text: str) -> dict:
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    return json.loads(text)

async def judge_adjudication_node(state: DebateState, frontier_llm=None) -> DebateState:
    if frontier_llm is None:
        from app.engine.llm_factory import get_llm
        frontier_llm = get_llm("reasoning")

    full_transcript = "\n\n".join(
        f"[{t.role_title} - {t.sender_name} (Round {t.round_number} - {t.phase})]:\n{t.content}"
        for t in state.turns
    )
    
    response = await frontier_llm.ainvoke([
        SystemMessage(content=JUDGE_PROMPT),
        HumanMessage(content=f"TOPIC: {state.topic}\n\nFULL TRANSCRIPT:\n{full_transcript or 'No dialogue recorded.'}")
    ])
    
    parsed = extract_json(response.content)
    state.verdict = parsed
    state.is_completed = True
    return state
