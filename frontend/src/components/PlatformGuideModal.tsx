'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ShieldAlert,
  Users,
  Cpu,
  FileText,
  Sliders,
  Send,
  Plus,
  Award,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Scale,
  Search,
  ExternalLink
} from 'lucide-react';

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'modes' | 'agents' | 'features' | 'workflow'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold shadow-sm">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>PolyArguMinds Platform Guide</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Documentation & Features
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Autonomous Dialectic Stress-Testing Engine & Executive Decision Arbiter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 overflow-x-auto gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} />
            <span>Executive Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('modes')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'modes'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ShieldAlert size={14} />
            <span>Dialectic Modes</span>
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'agents'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Cpu size={14} />
            <span>Multi-Agent Swarm</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sliders size={14} />
            <span>Platform Features</span>
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'workflow'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>How to Run</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-sm space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">
                  <Lightbulb size={16} />
                  <span>The Core Philosophy</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  Stress-test high-stakes decisions before spending millions or committing engineering bandwidth.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  In enterprise teams, critical architectural proposals, executive mandates, and product roadmaps often suffer from confirmation bias, consensus complacency, or siloed blind spots. <strong>PolyArguMinds</strong> deploys an autonomous multi-agent dialectic arena where specialized AI agents debate both sides with intellectual rigor, grounded in your uploaded RFCs/PRDs, followed by an objective adjudicator synthesis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
                    01
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    Autonomous Red-Teaming
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Opposing specialized agents debate multi-round agendas spanning technical risk, scalability, governance, and business impact.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                    02
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    Audited Fact-Checking
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Live detection of logical fallacies and grounding verification against your uploaded documents with source citations.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm mb-3">
                    03
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    Actionable Decision Memo
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    A neutral executive verdict, multi-rubric scorecard matrix, prioritized action plan, and 1-click printable PDF report.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODES */}
          {activeTab === 'modes' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Red-Team Mode */}
                <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
                  <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-400 text-sm mb-2">
                    <ShieldAlert size={18} />
                    <span>Red-Team Stress-Test (Adversarial)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Designed for high-consequence technical or organizational bets where unaddressed risks could lead to outage, security breach, or massive cost overruns.
                  </p>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-inside">
                    <li><strong>Agent A (Lead Advocate):</strong> Champion of proposal, ROI, technical justification.</li>
                    <li><strong>Agent B (Chief Skeptic):</strong> Adversarial challenger testing operational fragility, migration cost, blast radius.</li>
                    <li><strong>Best For:</strong> Cloud migrations, core language swaps (e.g. Go vs Rust), mandatory RTO mandates, replacing teams with LLMs.</li>
                  </ul>
                </div>

                {/* Collaborative Review Mode */}
                <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
                  <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-400 text-sm mb-2">
                    <Users size={18} />
                    <span>Collaborative Review (Consensus-Driven)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Designed for architecture design reviews, cross-functional roadmapping, and pragmatic phased delivery where mutual agreement is required.
                  </p>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-inside">
                    <li><strong>Agent A (Lead Strategist):</strong> Focuses on capability enablement, velocity, and milestone roadmap.</li>
                    <li><strong>Agent B (Principal Reviewer):</strong> Highlights pragmatic governance, observability, maintenance, and trade-offs.</li>
                    <li><strong>Best For:</strong> Microservices refactoring, API standardizations, design systems, internal tooling frameworks.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AGENTS */}
          {activeTab === 'agents' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                PolyArguMinds constructs an autonomous committee of specialized personas dynamically tailored to your exact topic domain:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    A
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Agent A: Lead Advocate / Strategist
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Constructs structured affirmative arguments, benchmarks, and architectural designs. Formats arguments with clear <em>Core Stances</em>, <em>Key Evidence</em>, and <em>Executive Conclusions</em>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    B
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Agent B: Chief Skeptic / Principal Reviewer
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Scrutinizes premise validity, technical debt, failure points, recovery time objectives (RTO), and regulatory compliance. Probes weaknesses directly.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    LG
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Logician & Fallacy Detector
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Inspects each response in real time for cognitive traps and informal fallacies (Strawman, False Dilemma, Slippery Slope, Circular Reasoning) and flags them directly on the chat turn.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    GD
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Grounding & Retrieval Verification
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      When reference RFC/PRD documents are uploaded, the grounding engine verifies assertions and displays collated page-level citations to eliminate hallucination.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    AR
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Executive Adjudicator & Arbiter
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      At the debate conclusion, evaluates all arguments using a multi-rubric matrix (Logical Rigor, Evidence Grounding, Rebuttal Directness), compiles key concessions, and delivers a concrete decision verdict.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURES */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1.5">
                  <Sliders size={15} />
                  <span>Configurable Rounds (1 to 10)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tailor depth from a brisk 2-round assessment to an exhaustive 10-round deep dive. Each round maps to a distinct operational agenda.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                  <FileText size={15} />
                  <span>RFC & PRD Document Ingestion</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Upload PDF or TXT architectural proposals. Agents directly cite your company's specifications, constraints, and data tables.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
                  <Send size={15} />
                  <span>Real-time Human Steering</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Use the bottom interjection bar to steer the debate live (e.g. <em>"Must comply with SOC2"</em> or <em>"Cap budget at $50k"</em>). Agents adjust immediately.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5">
                  <Plus size={15} />
                  <span>Resume & Extend Sessions</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Concluded debates can be resumed anytime up to 10 total rounds. Bots pick up from current transcripts to explore deeper edge cases.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 md:col-span-2">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1.5">
                  <Award size={15} />
                  <span>Executive Decision Memo & 1-Click PDF</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Generate an institutional-grade PDF complete with multi-rubric scorecards, prioritized action plans, concessions made, and strictly 2–3 key takeaway bullet points per turn.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: WORKFLOW */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-6">
                <li className="ml-6">
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full font-bold text-xs">
                    1
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Submit Proposal or Architectural Decision
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Type your topic (e.g., <em>"Adopt Rust over Go for critical networking services"</em>) or pick from one of the quick presets on the dashboard.
                  </p>
                </li>

                <li className="ml-6">
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full font-bold text-xs">
                    2
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Configure Mode, Depth & Reference Context
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Choose <strong>Red-Team Stress-Test</strong> or <strong>Collaborative Review</strong>, select between 1 and 10 rounds, and optionally attach a PDF/TXT RFC.
                  </p>
                </li>

                <li className="ml-6">
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full font-bold text-xs">
                    3
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Watch Live Dialectic & Inject Constraints
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Watch the agents challenge each other turn by turn. Interject constraints whenever you need to steer the discussion toward specific organizational limits.
                  </p>
                </li>

                <li className="ml-6">
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full font-bold text-xs">
                    4
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Review Decision Memo & Export Executive Report
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Examine the final verdict, multi-rubric scorecards, blind spots, and export a clean PDF executive report for leadership review.
                  </p>
                </li>
              </ol>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Version 2.0 • Enterprise Adjudication Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm"
          >
            Got it, Let's Begin
          </button>
        </div>

      </div>
    </div>
  );
};
