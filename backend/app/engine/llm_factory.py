import os
import json
import asyncio
from typing import AsyncIterator, List, Any
from app.core.config import settings

class MockAIMessage:
    def __init__(self, content: str):
        self.content = content

class MockLLM:
    """Realistic dialectic mock generator for out-of-the-box local testing without API keys."""
    def __init__(self, role: str = "debater"):
        self.role = role

    async def ainvoke(self, messages: List[Any]) -> MockAIMessage:
        prompt_text = " ".join([m.content for m in messages if hasattr(m, 'content')])
        
        if "Debate Architect and Dialectic Systems Designer" in prompt_text:
            content = json.dumps({
                "personas": [
                    {
                        "identifier": "agent_a",
                        "name": "Dr. Sarah Chen",
                        "role_title": "Chief Systems Architect & Innovation Lead",
                        "bias_direction": "FOR",
                        "core_worldview": "Advocates for agile modularity, modern cloud-native scalability, and rapid technological advancement to prevent competitive stagnation.",
                        "avatar_color": "#4F46E5",
                        "system_prompt": "You are Dr. Sarah Chen, Chief Systems Architect. Champion the strategic benefits, high throughput, and developer autonomy of this transition while maintaining sound risk awareness."
                    },
                    {
                        "identifier": "agent_b",
                        "name": "Marcus Vance",
                        "role_title": "VP of Reliability & Financial Governance",
                        "bias_direction": "AGAINST",
                        "core_worldview": "Prioritizes operational resilience, deterministic cost structures, and rigorous risk containment over premature architectural complexity.",
                        "avatar_color": "#DC2626",
                        "system_prompt": "You are Marcus Vance, VP of Reliability & Financial Governance. Scrutinize the hidden operational overhead, network latency, distributed state hazards, and runaway infrastructure expenditures."
                    }
                ]
            })
            return MockAIMessage(content)
        
        elif "Debate Referee" in prompt_text:
            # Detect whether we should inject a fallacy for demo
            if "disaster" in prompt_text.lower() or "catastrophe" in prompt_text.lower() or "blindly" in prompt_text.lower():
                content = json.dumps({
                    "fallacies": [
                        {
                            "fallacy_type": "SLIPPERY_SLOPE",
                            "quote": "If we delay this migration, our infrastructure will inevitably crumble and cause catastrophic market failure.",
                            "explanation": "Extrapolates from architectural maintenance overhead directly to inevitable corporate collapse without empirical nexus."
                        }
                    ]
                })
            else:
                content = json.dumps({"fallacies": []})
            return MockAIMessage(content)

        elif "Chief Adjudicator and Senior Strategic Decision Arbiter" in prompt_text:
            content = json.dumps({
                "winner_identifier": "agent_a",
                "scorecard": {
                    "agent_a": {
                        "logical_rigor": 8.8,
                        "evidence_grounding": 8.5,
                        "rebuttal_directness": 8.9,
                        "total": 8.7
                    },
                    "agent_b": {
                        "logical_rigor": 8.4,
                        "evidence_grounding": 8.6,
                        "rebuttal_directness": 8.2,
                        "total": 8.4
                    }
                },
                "key_concessions": [
                    "Agent A conceded that distributed transactional boundaries introduce non-trivial observability and debugging overhead.",
                    "Agent B acknowledged that monolithic database lock contention currently limits peak quarterly scaling."
                ],
                "unresolved_risks": [
                    "Data migration synchronization strategy for legacy multi-tenant schemas remains unquantified.",
                    "Team upskilling curve and initial velocity deceleration over the first two quarters."
                ],
                "executive_recommendation": "PROCEED WITH CONDITIONAL STAGED PILOT: Decouple read-heavy reporting services first before decomposing core transactional writes.",
                "action_plan": [
                    "Form a cross-functional Platform Enablement squad to establish CI/CD canary automation.",
                    "Establish strict latency and budget SLAs (hard cap of 12% cloud budget expansion).",
                    "Conduct a two-week proof-of-concept on the isolated notification microservice."
                ]
            })
            return MockAIMessage(content)

        else:
            # Standard debater turn
            if "PHASE: FOUNDATION" in prompt_text:
                content = (
                    "To establish our foundational premise: our strategic imperative requires decoupling monolithic bottlenecks. "
                    "By adopting an event-driven, domain-isolated microservices topology, we isolate critical failure domains and enable independent deployment cycles. "
                    "Empirical industry benchmarks demonstrate a 3x increase in team deployment velocity once domain boundaries are solidified."
                )
            elif "PHASE: EVIDENCE" in prompt_text:
                content = (
                    "Examining empirical operating parameters: our transaction latency percentiles (p99) on the primary monolith spike to 850ms during peak load. "
                    "Decoupling into isolated services with read-replicas reduces p99 latency to under 90ms. "
                    "Furthermore, fault isolation prevents non-critical background jobs from saturating checkout thread pools."
                )
            else:
                content = (
                    "Directly addressing the financial critique: the initial infrastructural CapEx is outweighed by operational savings within 18 months. "
                    "Moreover, container autoscaling allows us to scale compute elastically rather than provisioning for worst-case peak capacity 24/7."
                )
            return MockAIMessage(content)


def get_llm(tier: str = "fast"):
    """
    Tiered LLM Router:
    tier: 'fast' (for debater turns & referee) or 'reasoning' (for judge & deep analysis)
    """
    openrouter_key = settings.get_effective_openrouter_key()
    gemini_key = settings.get_effective_gemini_key()
    openai_key = settings.get_effective_openai_key()
    anthropic_key = settings.get_effective_anthropic_key()

    if openrouter_key:
        try:
            from langchain_openai import ChatOpenAI
            model_name = settings.FAST_LLM_MODEL if tier == "fast" else settings.REASONING_LLM_MODEL
            model_name = model_name or "meta-llama/llama-3.3-70b-instruct"
            return ChatOpenAI(
                model=model_name,
                openai_api_key=openrouter_key,
                openai_api_base=settings.OPENROUTER_BASE_URL,
                temperature=0.3 if tier == "fast" else 0.2,
                max_tokens=1500
            )
        except Exception as e:
            print(f"Warning: Failed to init OpenRouter ChatOpenAI: {e}")

    if tier == "fast":
        if gemini_key:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                return ChatGoogleGenerativeAI(
                    model=settings.FAST_LLM_MODEL or "gemini-2.0-flash",
                    google_api_key=gemini_key,
                    temperature=0.3
                )
            except Exception as e:
                print(f"Warning: Failed to init ChatGoogleGenerativeAI: {e}")
        elif openai_key:
            try:
                from langchain_openai import ChatOpenAI
                return ChatOpenAI(
                    model="gpt-4o-mini",
                    api_key=openai_key,
                    temperature=0.3
                )
            except Exception as e:
                print(f"Warning: Failed to init ChatOpenAI: {e}")

    # Reasoning tier
    if tier == "reasoning":
        if anthropic_key:
            try:
                from langchain_anthropic import ChatAnthropic
                return ChatAnthropic(
                    model=settings.REASONING_LLM_MODEL or "claude-3-5-sonnet-20241022",
                    api_key=anthropic_key,
                    temperature=0.2
                )
            except Exception as e:
                print(f"Warning: Failed to init ChatAnthropic: {e}")
        elif gemini_key:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                return ChatGoogleGenerativeAI(
                    model="gemini-2.0-flash",
                    google_api_key=gemini_key,
                    temperature=0.2
                )
            except Exception as e:
                print(f"Warning: Failed to init Gemini for reasoning: {e}")
        elif openai_key:
            try:
                from langchain_openai import ChatOpenAI
                return ChatOpenAI(
                    model="gpt-4o",
                    api_key=openai_key,
                    temperature=0.2
                )
            except Exception as e:
                print(f"Warning: Failed to init ChatOpenAI reasoning: {e}")

    # Fallback to realistic MockLLM
    return MockLLM(role=tier)
