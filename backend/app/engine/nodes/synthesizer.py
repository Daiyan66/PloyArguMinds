import json
import uuid
import re
from langchain_core.messages import SystemMessage, HumanMessage
from app.engine.state import DebateState, Persona

def get_synthesizer_prompt(mode: str) -> str:
    if mode == "COLLABORATIVE":
        return """
You are an expert Systems Architect and Strategic Design Review Facilitator.
Analyze the provided topic and reference document context.
The participants are engaged in a COLLABORATIVE DESIGN REVIEW (not an adversarial fight).
They must constructively analyze complementary perspectives (e.g. Velocity & Modernization vs Reliability & Operational Governance) to synthesize an optimal, derisked architectural roadmap.

Design two world-class expert personas with complementary mandates:
- Agent A: Lead Strategist / System Architect (focus on innovation, throughput, developer velocity, strategic capabilities).
- Agent B: Principal Reviewer / Operations Director (focus on cost efficiency, reliability, security, maintainability).

Output strictly valid JSON with this schema:
{
  "personas": [
    {
      "identifier": "agent_a",
      "name": "First Last",
      "role_title": "Specific Lead Title",
      "bias_direction": "CAPABILITY",
      "core_worldview": "Constructive stance emphasizing modernization and business agility.",
      "avatar_color": "#6366F1",
      "system_prompt": "You are Agent A in a Collaborative Design Review. Emphasize long-term agility and strategic upside, while actively listening to risk concerns."
    },
    {
      "identifier": "agent_b",
      "name": "First Last",
      "role_title": "Specific Governance/Ops Title",
      "bias_direction": "GOVERNANCE",
      "core_worldview": "Constructive stance emphasizing operational resilience, budget predictability, and security.",
      "avatar_color": "#A855F7",
      "system_prompt": "You are Agent B in a Collaborative Design Review. Scrutinize operational constraints, SLA maintenance, and cloud spend, aiming for a feasible middle ground."
    }
  ]
}
"""
    else:
        return """
You are an expert Debate Architect and Dialectic Systems Designer.
Analyze the provided topic and reference document context.
The participants are engaged in an ADVERSARIAL RED-TEAM STRESS-TEST.
Identify the primary underlying friction (e.g. Innovation vs Compliance, Security vs Velocity, CapEx vs Capital Efficiency).

Design two opposing world-class expert personas who will rigorously clash:
- Agent A: Lead Advocate (ardent champion of the proposal).
- Agent B: Chief Skeptic (uncompromising red-teamer exposing hidden vulnerabilities).

Output strictly valid JSON with this schema:
{
  "personas": [
    {
      "identifier": "agent_a",
      "name": "First Last",
      "role_title": "Specific Champion Title",
      "bias_direction": "FOR",
      "core_worldview": "Core champion thesis and strategic rationale.",
      "avatar_color": "#4F46E5",
      "system_prompt": "You are Agent A in an Adversarial Red-Team Clash. Vigorously defend the proposal with empirical evidence."
    },
    {
      "identifier": "agent_b",
      "name": "First Last",
      "role_title": "Specific Counter-Title",
      "bias_direction": "AGAINST",
      "core_worldview": "Core skeptical thesis exposing failure modes and hidden costs.",
      "avatar_color": "#DC2626",
      "system_prompt": "You are Agent B in an Adversarial Red-Team Clash. Aggressively dismantle flawed assumptions and demand hard evidence."
    }
  ]
}
"""

def extract_json(text: str) -> dict:
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    return json.loads(text)

async def synthesize_personas_node(state: DebateState, llm=None) -> DebateState:
    if llm is None:
        from app.engine.llm_factory import get_llm
        llm = get_llm("fast")

    mode_label = "Collaborative Design Review" if state.mode == "COLLABORATIVE" else "Adversarial Red-Team Clash"
    prompt = get_synthesizer_prompt(state.mode)
    context = (
        f"Topic: {state.topic}\n"
        f"Mode: {mode_label}\n\n"
        f"Document Reference:\n{state.document_context or 'None provided.'}"
    )
    
    response = await llm.ainvoke([
        SystemMessage(content=prompt),
        HumanMessage(content=context)
    ])
    
    parsed = extract_json(response.content)
    personas_list = []
    for p in parsed.get("personas", []):
        personas_list.append(Persona(
            id=str(uuid.uuid4()),
            identifier=p["identifier"],
            name=p["name"],
            role_title=p["role_title"],
            bias_direction=p.get("bias_direction", "FOR" if p["identifier"] == "agent_a" else "AGAINST"),
            core_worldview=p["core_worldview"],
            system_prompt=p["system_prompt"],
            avatar_color=p.get("avatar_color", "#4F46E5" if p["identifier"] == "agent_a" else "#DC2626")
        ))

    # Fallback if parsing produced fewer than 2
    if len(personas_list) < 2:
        is_collab = state.mode == "COLLABORATIVE"
        personas_list = [
            Persona(
                id=str(uuid.uuid4()),
                identifier="agent_a",
                name="Dr. Alex Rivera",
                role_title="Lead System Strategist" if is_collab else "Lead Innovation Advocate",
                bias_direction="CAPABILITY" if is_collab else "FOR",
                core_worldview="Advocates for agile execution, modular scaling, and strategic modernization.",
                system_prompt="Champion the strategic potential and capabilities of this initiative.",
                avatar_color="#6366F1"
            ),
            Persona(
                id=str(uuid.uuid4()),
                identifier="agent_b",
                name="Elena Rostova",
                role_title="Principal Operations Director" if is_collab else "Chief Risk & Reliability Officer",
                bias_direction="GOVERNANCE" if is_collab else "AGAINST",
                core_worldview="Prioritizes operational resilience, compliance, and deterministic cost ceilings.",
                system_prompt="Scrutinize operational hazards and maintain strict governance standards.",
                avatar_color="#A855F7" if is_collab else "#DC2626"
            )
        ]

    state.personas = personas_list
    return state
