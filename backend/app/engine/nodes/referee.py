import json
import re
from langchain_core.messages import SystemMessage, HumanMessage
from app.engine.state import DebateState, FallacyAlert

REFEREE_PROMPT = """
You are an uncompromising Formal Logician and Debate Referee.
Examine the active speaker's latest response in light of the opponent's previous statement.
Detect any of the following informal fallacies:
- STRAWMAN: Misrepresenting or caricaturing the opponent's claim.
- AD_HOMINEM: Attacking persona traits or motives instead of substance.
- FALSE_DICHOTOMY: Presenting a false either/or binary.
- SLIPPERY_SLOPE: Claiming an extreme, unjustified chain of disasters.
- CIRCULAR_REASONING: Assuming the conclusion in the premise.

Output strictly valid JSON with this schema:
{
  "fallacies": [
    {
      "fallacy_type": "STRAWMAN | AD_HOMINEM | FALSE_DICHOTOMY | SLIPPERY_SLOPE | CIRCULAR_REASONING",
      "quote": "Exact verbatim quote from the active message",
      "explanation": "Concise 1-sentence breakdown of why this is logically flawed."
    }
  ]
}
If no fallacies are present, return { "fallacies": [] }.
"""

def extract_json(text: str) -> dict:
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    return json.loads(text)

async def referee_audit_node(state: DebateState, fast_llm=None) -> DebateState:
    if fast_llm is None:
        from app.engine.llm_factory import get_llm
        fast_llm = get_llm("fast")

    if len(state.turns) < 2:
        return state

    latest_turn = state.turns[-1]
    preceding_turn = state.turns[-2]

    # Don't referee moderator interjections
    if latest_turn.speaker_id == "moderator":
        return state

    context = f"OPPONENT SAID:\n{preceding_turn.content}\n\nACTIVE SPEAKER REPLIED:\n{latest_turn.content}"

    try:
        response = await fast_llm.ainvoke([
            SystemMessage(content=REFEREE_PROMPT),
            HumanMessage(content=context)
        ])
        data = extract_json(response.content)
        for f in data.get("fallacies", []):
            latest_turn.fallacies.append(FallacyAlert(
                fallacy_type=f.get("fallacy_type", "FALLACY"),
                quote=f.get("quote", ""),
                explanation=f.get("explanation", "")
            ))
    except Exception as e:
        print(f"Referee audit skipped: {e}")

    return state
