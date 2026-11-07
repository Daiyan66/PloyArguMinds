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

            is_agent_b = "agent_b" in prompt_text or "Marcus" in prompt_text or "AGAINST" in prompt_text or "Reviewer" in prompt_text

            if "PHASE: FOUNDATION" in prompt_text:
                if not is_agent_b:
                    content = (
                        f"**Core Stance:** We strongly advocate for moving forward with: {topic_hint}. "
                        "Establishing high velocity and modern foundational standards is essential to maintain competitive advantage.\n\n"
                        "**Key Argument & Evidence:** By modernizing our posture now, empirical industry benchmarks demonstrate a 25-35% reduction in long-term incident resolution times and higher developer satisfaction.\n\n"
                        "**Rebuttal / Scrutiny:** Concerns regarding transition disruption are valid but can be mitigated through disciplined phased scheduling.\n\n"
                        "**Bottom Line:** Leadership should endorse this initiative with clear milestones to maintain strategic agility."
                    )
                else:
                    content = (
                        f"**Core Stance:** We urge rigorous prudence regarding: {topic_hint}. "
                        "Stability, financial discipline, and operational risk containment must take precedence over unproven changes.\n\n"
                        "**Key Argument & Evidence:** Operational history shows that 60% of rapid architectural shifts exceed initial cost budgets by at least 2x and introduce unforeseen edge-case failure modes.\n\n"
                        "**Rebuttal / Scrutiny:** Theoretical velocity gains are illusory if production downtime or customer attrition spikes during the transition.\n\n"
                        "**Bottom Line:** We must mandate strict financial and latency guardrails before committing capital or engineering hours."
                    )
            elif "PHASE: EVIDENCE" in prompt_text:
                if not is_agent_b:
                    content = (
                        f"**Core Stance:** Concrete operational evidence demonstrates that {topic_hint} yields measurable ROI.\n\n"
                        "**Key Argument & Evidence:** Benchmark testing across peer organizations shows p99 latency improvements of up to 40% and a 50% decrease in memory footprint.\n\n"
                        "**Rebuttal / Scrutiny:** The governance team fears budget overruns, but cloud autoscaling and reduced CPU utilization directly drive operational cost downs.\n\n"
                        "**Bottom Line:** The risk of inaction and technical stagnation is significantly greater than the managed cost of adoption."
                    )
                else:
                    content = (
                        f"**Core Stance:** The proposed benefits of {topic_hint} overlook critical hidden migration and licensing overhead.\n\n"
                        "**Key Argument & Evidence:** Engineering ramp-up time typically reduces sprint delivery by 20% in the first two quarters, creating backlog debt.\n\n"
                        "**Rebuttal / Scrutiny:** The advocate's benchmarks reflect idealized lab environments, not legacy production data with accumulated technical debt.\n\n"
                        "**Bottom Line:** Require an isolated two-sprint proof of concept with strict exit criteria before enterprise-wide greenlighting."
                    )
            else:
                if not is_agent_b:
                    content = (
                        f"**Core Stance:** In conclusion, {topic_hint} is a strategic necessity that our team is fully equipped to execute.\n\n"
                        "**Key Argument & Evidence:** We have validated that canary deployments and fallback toggles reduce rollout risk to near zero.\n\n"
                        "**Rebuttal / Scrutiny:** We fully accept the requirement for budget caps and 90-day checkpoint reviews proposed by governance.\n\n"
                        "**Bottom Line:** Approve the staged adoption plan with defined telemetry thresholds."
                    )
                else:
                    content = (
                        f"**Core Stance:** We conclude that {topic_hint} can only proceed under strict phased constraints and executive oversight.\n\n"
                        "**Key Argument & Evidence:** A gated rollout ensuring zero customer impact is the only acceptable path to protect core SLAs.\n\n"
                        "**Rebuttal / Scrutiny:** We concede that modernizing critical components is desirable once safety nets are verified in staging.\n\n"
                        "**Bottom Line:** Greenlight a pilot phase only, conditional on hard spend limits and weekly review."
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
