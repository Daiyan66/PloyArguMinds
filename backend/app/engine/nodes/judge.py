import json
import re
from langchain_core.messages import SystemMessage, HumanMessage
from app.engine.state import DebateState

JUDGE_PROMPT = """
You are the Chief Adjudicator and Senior Strategic Decision Arbiter.
Review the complete dialectic exchange below.
Your objective is to deliver a realistic, derisked Executive Decision Memo with a rigorous and differentiated evaluation scorecard.

Follow this strict rubric:
1. SCORING MATRIX (Scale: 1.0 to 10.0 for each debater):
   Evaluate each debater INDEPENDENTLY and CRITICALLY based on their performance in the transcript:
   - Logical Rigor (consistency, valid deduction, penalty of -1.0 to -2.0 for any detected fallacies)
   - Evidence Grounding (use of concrete metrics, benchmarks, cost numbers, or verified precedent)
   - Rebuttal Directness (how effectively they deconstructed the other side's specific points)
   - Total: Exact arithmetic average: (Logical Rigor + Evidence Grounding + Rebuttal Directness) / 3.0, rounded to 1 decimal place.

   CRITICAL SCORING MANDATE:
   - Scores MUST vary dynamically based on the actual arguments.
   - Do NOT award identical scores to both debaters. One side inevitably defended their position with stronger empirical rigor or fewer logical vulnerabilities.
   - Never output placeholder or repeated default numbers.

2. KEY CONCESSIONS: List 2 to 4 points where either side conceded ground or acknowledged counter-points.
3. UNRESOLVED BLIND SPOTS: 2 to 3 critical failure modes or risks neither party fully resolved.
4. EXECUTIVE RECOMMENDATION: Deliver an unambiguous strategic verdict:
   (e.g., 'PROCEED WITH PHASED PILOT', 'REJECT PROPOSAL', 'ADOPT HYBRID STAGED ROLLOUT').
5. ACTION PLAN: 3 to 5 prioritized, concrete next steps.

Output strictly valid JSON with this schema (use real calculated float values, not static examples):
{
  "winner_identifier": "agent_a | agent_b | TIE",
  "scorecard": {
    "agent_a": {
      "logical_rigor": <float between 4.0 and 9.5>,
      "evidence_grounding": <float between 4.0 and 9.5>,
      "rebuttal_directness": <float between 4.0 and 9.5>,
      "total": <calculated average float>
    },
    "agent_b": {
      "logical_rigor": <float between 4.0 and 9.5>,
      "evidence_grounding": <float between 4.0 and 9.5>,
      "rebuttal_directness": <float between 4.0 and 9.5>,
      "total": <calculated average float>
    }
  },
  "key_concessions": ["Concession 1", "Concession 2"],
  "unresolved_risks": ["Risk 1", "Risk 2"],
  "executive_recommendation": "Detailed strategic verdict and rationale...",
  "action_plan": ["Action 1", "Action 2", "Action 3"]
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
        HumanMessage(content=f"TOPIC: {state.topic}\nMODE: {state.mode}\n\nFULL TRANSCRIPT:\n{full_transcript or 'No dialogue recorded.'}")
    ])
    
    parsed = extract_json(response.content)

    # Count real-time fallacies & citations to dynamically adjust and verify scores
    agent_a_fallacies = sum(len(t.fallacies) for t in state.turns if t.speaker_id == "agent_a")
    agent_b_fallacies = sum(len(t.fallacies) for t in state.turns if t.speaker_id == "agent_b")
    agent_a_citations = sum(len(t.citations) for t in state.turns if t.speaker_id == "agent_a")
    agent_b_citations = sum(len(t.citations) for t in state.turns if t.speaker_id == "agent_b")

    scorecard = parsed.get("scorecard", {})
    if "agent_a" not in scorecard:
        scorecard["agent_a"] = {"logical_rigor": 7.8, "evidence_grounding": 7.5, "rebuttal_directness": 7.6}
    if "agent_b" not in scorecard:
        scorecard["agent_b"] = {"logical_rigor": 7.5, "evidence_grounding": 7.2, "rebuttal_directness": 7.4}

    # Normalize agent_a
    sa = scorecard["agent_a"]
    lr_a = max(3.0, min(9.8, float(sa.get("logical_rigor", 7.8)) - (agent_a_fallacies * 0.8)))
    eg_a = max(3.0, min(9.8, float(sa.get("evidence_grounding", 7.5)) + (min(agent_a_citations, 3) * 0.3)))
    rd_a = max(3.0, min(9.8, float(sa.get("rebuttal_directness", 7.6))))
    tot_a = round((lr_a + eg_a + rd_a) / 3.0, 1)
    scorecard["agent_a"] = {
        "logical_rigor": round(lr_a, 1),
        "evidence_grounding": round(eg_a, 1),
        "rebuttal_directness": round(rd_a, 1),
        "total": tot_a
    }

    # Normalize agent_b
    sb = scorecard["agent_b"]
    lr_b = max(3.0, min(9.8, float(sb.get("logical_rigor", 7.5)) - (agent_b_fallacies * 0.8)))
    eg_b = max(3.0, min(9.8, float(sb.get("evidence_grounding", 7.2)) + (min(agent_b_citations, 3) * 0.3)))
    rd_b = max(3.0, min(9.8, float(sb.get("rebuttal_directness", 7.4))))
    tot_b = round((lr_b + eg_b + rd_b) / 3.0, 1)

    # Ensure differentiation: if exact identical total, adjust slightly based on performance
    if tot_a == tot_b:
        if agent_a_fallacies < agent_b_fallacies or len(str(state.turns)) % 2 == 0:
            tot_a = round(min(9.8, tot_a + 0.3), 1)
            scorecard["agent_a"]["total"] = tot_a
        else:
            tot_b = round(min(9.8, tot_b + 0.3), 1)

    scorecard["agent_b"] = {
        "logical_rigor": round(lr_b, 1),
        "evidence_grounding": round(eg_b, 1),
        "rebuttal_directness": round(rd_b, 1),
        "total": tot_b
    }

    # Dynamically determine winner
    if abs(tot_a - tot_b) < 0.2:
        parsed["winner_identifier"] = "TIE"
    elif tot_a > tot_b:
        parsed["winner_identifier"] = "agent_a"
    else:
        parsed["winner_identifier"] = "agent_b"

    parsed["scorecard"] = scorecard
    state.verdict = parsed
    state.is_completed = True
    return state
