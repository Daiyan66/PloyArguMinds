from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class Citation(BaseModel):
    source_title: str
    page_number: Optional[int] = None
    url: Optional[str] = None
    snippet: str

class FallacyAlert(BaseModel):
    fallacy_type: str  # "STRAWMAN", "AD_HOMINEM", "FALSE_DICHOTOMY", "SLIPPERY_SLOPE", "CIRCULAR"
    quote: str
    explanation: str

class MessageTurn(BaseModel):
    id: str
    speaker_id: str
    sender_name: str
    role_title: str
    round_number: int
    phase: str  # "FOUNDATION", "EVIDENCE", "CLASH", "INTERJECTION"
    content: str
    citations: List[Citation] = Field(default_factory=list)
    fallacies: List[FallacyAlert] = Field(default_factory=list)

class Persona(BaseModel):
    id: str
    identifier: str  # "agent_a", "agent_b", "judge"
    name: str
    role_title: str
    bias_direction: str  # "FOR", "AGAINST", "NEUTRAL"
    core_worldview: str
    system_prompt: str
    avatar_color: str = "#6366F1"

class HumanInterjection(BaseModel):
    user_name: str = "Moderator"
    content: str
    target_persona_id: Optional[str] = None

class DebateState(BaseModel):
    session_id: str
    topic: str
    mode: str = "DEBATE"
    document_context: Optional[str] = None
    personas: List[Persona] = Field(default_factory=list)
    turns: List[MessageTurn] = Field(default_factory=list)
    current_round: int = 1
    total_rounds: int = 5
    active_persona_idx: int = 0
    is_completed: bool = False
    pending_interjections: List[HumanInterjection] = Field(default_factory=list)
    verdict: Optional[Dict[str, Any]] = None
