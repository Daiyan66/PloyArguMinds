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
            # Generate dynamic scores derived from prompt length and topic
            score_seed = (len(prompt_text) % 17) / 10.0
            score_a_lr = round(min(9.5, max(6.5, 7.8 + score_seed * 0.4)), 1)
            score_a_eg = round(min(9.5, max(6.5, 7.5 + score_seed * 0.3)), 1)
            score_a_rd = round(min(9.5, max(6.5, 8.0 - score_seed * 0.2)), 1)
            total_a = round((score_a_lr + score_a_eg + score_a_rd) / 3.0, 1)

            score_b_lr = round(min(9.5, max(6.5, 7.4 - score_seed * 0.3)), 1)
            score_b_eg = round(min(9.5, max(6.5, 7.8 + score_seed * 0.2)), 1)
            score_b_rd = round(min(9.5, max(6.5, 7.5 + score_seed * 0.3)), 1)
            total_b = round((score_b_lr + score_b_eg + score_b_rd) / 3.0, 1)
            
            winner = "agent_a" if total_a > total_b else ("agent_b" if total_b > total_a else "TIE")

            content = json.dumps({
                "winner_identifier": winner,
                "scorecard": {
                    "agent_a": {
                        "logical_rigor": score_a_lr,
                        "evidence_grounding": score_a_eg,
                        "rebuttal_directness": score_a_rd,
                        "total": total_a
                    },
                    "agent_b": {
                        "logical_rigor": score_b_lr,
                        "evidence_grounding": score_b_eg,
                        "rebuttal_directness": score_b_rd,
                        "total": total_b
                    }
                },
                "key_concessions": [
                    "Both sides acknowledged that initial migration friction and team ramp-up introduce operational overhead.",
                    "Skeptic accepted that long-term resilience and determinism outweigh initial baseline tooling costs."
                ],
                "unresolved_risks": [
                    "Production telemetry and observability tooling during the phased rollout period.",
                    "Potential delivery delay during the first two transition quarters."
                ],
                "executive_recommendation": f"PROCEED WITH CONTROLLED STAGED ROLLOUT: Implement a targeted 90-day pilot focusing on non-critical service paths before wider adoption.",
                "action_plan": [
                    "Establish clear baseline operational metrics and SLAs prior to initiating changes.",
                    "Deploy automated canary validation pipelines to catch regression early.",
                    "Review pilot outcomes at the 60-day milestone with leadership stakeholders."
                ]
            })
            return MockAIMessage(content)

        else:
            # Dynamic debater turn extracting topic and role
            topic_hint = "this proposal"
            if "TOPIC:" in prompt_text:
                try:
                    topic_hint = prompt_text.split("TOPIC:")[1].split("\n")[0].strip()
                except Exception:
                    pass

            aspect_hint = "Core Architecture"
            if "ASSIGNED ROUND FOCUS:" in prompt_text:
                try:
                    aspect_hint = prompt_text.split("ASSIGNED ROUND FOCUS:")[1].split("\n")[0].strip()
                except Exception:
                    pass

            is_agent_b = "agent_b" in prompt_text or "Marcus" in prompt_text or "AGAINST" in prompt_text or "Reviewer" in prompt_text

            if "PHASE: FOUNDATION" in prompt_text or "Architecture" in aspect_hint:
                if not is_agent_b:
                    content = (
                        f"**Core Stance on {aspect_hint}:** We strongly champion moving forward with {topic_hint}. "
                        "Establishing high velocity and a modern, domain-isolated foundational standard is essential to eliminate legacy bottlenecks.\n\n"
                        f"**Key Argument & Evidence:** In terms of {aspect_hint}, empirical industry benchmarks demonstrate a 30-40% reduction in critical path complexity and superior resource determinism under peak load.\n\n"
                        "**Rebuttal / Scrutiny:** Concerns regarding architectural unfamiliarity are understandable, but clear domain boundaries minimize systemic risk.\n\n"
                        f"**Bottom Line:** Leadership should validate the architectural soundness of {topic_hint} and greenlight the foundational baseline."
                    )
                else:
                    content = (
                        f"**Core Stance on {aspect_hint}:** We urge deep scrutiny regarding the structural assumptions of {topic_hint}. "
                        "Premature architectural complexity inevitably leads to distributed failure cascades and opaque runtime behavior.\n\n"
                        f"**Key Argument & Evidence:** Regarding {aspect_hint}, historical telemetry reveals that radical shifts introduce undocumented edge-case failure modes and complicate root-cause diagnostics during outages.\n\n"
                        "**Rebuttal / Scrutiny:** Theoretical architectural purity cannot compensate for the battle-tested predictability of our current baseline.\n\n"
                        f"**Bottom Line:** We must demand rigorous architectural proof of concept and deterministic fallback topologies before committing."
                    )
            elif "PHASE: EVIDENCE" in prompt_text or "Velocity" in aspect_hint or "TCO" in aspect_hint:
                if not is_agent_b:
                    content = (
                        f"**Core Stance on {aspect_hint}:** Concrete data establishes that {topic_hint} delivers superior operational returns.\n\n"
                        f"**Key Argument & Evidence:** Evaluating {aspect_hint}, team delivery metrics show that modern compiler safeguards and automated tooling reduce downstream defect escape rates by 45%.\n\n"
                        "**Rebuttal / Scrutiny:** The governance reviewer anticipates massive velocity slowdowns, but modular decoupling accelerates independent squad deployments after an initial sprint.\n\n"
                        f"**Bottom Line:** The measurable gains in {aspect_hint} far outweigh the temporary friction of adoption."
                    )
                else:
                    content = (
                        f"**Core Stance on {aspect_hint}:** The projected benefits for {aspect_hint} drastically underestimate hidden frictional costs.\n\n"
                        f"**Key Argument & Evidence:** Evaluating {aspect_hint}, enterprise retrospectives indicate that steep learning curves reduce team delivery capacity by at least 25% over the first two quarters, compounding backlog debt.\n\n"
                        "**Rebuttal / Scrutiny:** The advocate assumes optimal team ramp-up, ignoring inevitable hiring scarcity and specialized contractor premiums.\n\n"
                        f"**Bottom Line:** Require explicit velocity SLAs and hard spend caps before expanding the initiative beyond an isolated squad."
                    )
            else:
                if not is_agent_b:
                    content = (
                        f"**Core Stance on {aspect_hint}:** In conclusion, {topic_hint} represents a strategic imperative that balances innovation with controlled risk.\n\n"
                        f"**Key Argument & Evidence:** Across {aspect_hint}, automated canary testing and staged rollback gates provide zero-downtime safety nets for production stability.\n\n"
                        "**Rebuttal / Scrutiny:** We fully accept the governance recommendation for strict 60-day telemetry milestones and budgetary boundaries.\n\n"
                        "**Bottom Line:** Endorse the staged rollout with defined review checkpoints to secure strategic competitive advantage."
                    )
                else:
                    content = (
                        f"**Core Stance on {aspect_hint}:** We maintain that {topic_hint} is only viable under strict executive guardrails and phased milestones.\n\n"
                        f"**Key Argument & Evidence:** Our analysis of {aspect_hint} mandates that core revenue-critical paths remain untouched until peripheral pilots prove zero customer disruption.\n\n"
                        "**Rebuttal / Scrutiny:** We acknowledge the advocate's willingness to implement budget caps and automated rollback tripwires.\n\n"
                        "**Bottom Line:** Authorize a limited-scope pilot only, contingent on hard performance thresholds and weekly executive audits."
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
