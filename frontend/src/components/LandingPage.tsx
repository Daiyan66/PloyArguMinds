'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Cpu,
  ArrowRight,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Scale,
  FileText,
  Lock,
  ChevronRight,
  Activity,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { GoogleAuthModal, GoogleLogoIcon, GoogleSignInButton } from './GoogleAuthModal';
import { PlatformGuideModal } from './PlatformGuideModal';

export const LandingPage: React.FC<{ onLaunchDashboard?: () => void }> = ({ onLaunchDashboard }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [simulatedTurnIndex, setSimulatedTurnIndex] = useState(0);

  // Simulated live dialectic preview loop
  const MOCK_TURNS = [
    {
      speaker: 'Agent A (Lead Advocate)',
      initials: 'AA',
      badge: 'Advocate',
      color: 'bg-indigo-600',
      tag: 'Core Stance',
      content: 'Migrating to microservices isolates deployment blast radius and boosts velocity for independent domain teams from 2-week release cycles down to continuous deployment.'
    },
    {
      speaker: 'Agent B (Chief Skeptic)',
      initials: 'CS',
      badge: 'Skeptic',
      color: 'bg-rose-600',
      tag: 'Counterpoint',
      content: 'Distributed architectures replace in-memory calls with network hops, multiplying observability overhead, cross-boundary latency, and 3x cloud infrastructure spend.'
    },
    {
      speaker: 'Logician Engine',
      initials: 'LG',
      badge: 'Fallacy Intercept',
      color: 'bg-amber-600',
      tag: 'Fallacy Flag',
      content: 'Flagged False Dilemma: Framing monolithic stability vs microservice velocity ignores modular monolith paradigms.'
    },
    {
      speaker: 'Executive Arbiter',
      initials: 'EA',
      badge: 'Adjudicator Verdict',
      color: 'bg-purple-600',
      tag: 'Verdict',
      content: 'Approved with Condition: Adopt modular domain monolith first; carve out microservices only for high-throughput billing service.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedTurnIndex((prev) => (prev + 1) % MOCK_TURNS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeTurn = MOCK_TURNS[simulatedTurnIndex];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-sm">
              PA
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-none">
                PolyArguMinds
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Executive Dialectic Arbiter
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setShowGuideModal(true)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <BookOpen size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Platform Guide</span>
            </button>

            <ThemeToggle />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
                {onLaunchDashboard ? (
                  <button
                    onClick={onLaunchDashboard}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Dashboard</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <Link
                    href="/dashboard"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Dashboard</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Sign Out"
                >
                  <Lock size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-sm transition"
              >
                <GoogleLogoIcon className="w-3.5 h-3.5" />
                <span>Google Sign-In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6">
        {/* Soft Background Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Hero Copy & Google Login Card */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span>Autonomous Dialectic Stress-Testing Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Stress-test high-stakes decisions <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">before millions</span> are on the line.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Deploy autonomous AI advocates and skeptics to debate both sides of architectural proposals, technical RFCs, and organizational mandates with real-time fallacy checking and neutral executive adjudication.
            </p>

            {/* Google Login Authentication Hub */}
            <div className="pt-2">
              {!isAuthenticated ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-w-md mx-auto lg:mx-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Lock size={14} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Enterprise Single Sign-On</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                      Google OAuth Only
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    PolyArguMinds enforces Google authentication for all decision leads, executives, and architects.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-[0.99]"
                  >
                    <GoogleLogoIcon className="w-5 h-5" />
                    <span>Sign in with Google Account</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>✓ Instant one-tap access</span>
                    <span>✓ Zero password credential fatigue</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-md max-w-md mx-auto lg:mx-0 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 size={16} />
                    <span>Authenticated as {user?.name}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Your Google session is active. You have full access to create new stress-tests, inspect past sessions, and download executive memos.
                  </p>
                  {onLaunchDashboard ? (
                    <button
                      onClick={onLaunchDashboard}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Enter Dialectic Workspace</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Enter Dialectic Workspace</span>
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats Banner */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-6 sm:gap-8 text-left">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">100%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Autonomous Arena</div>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:border-slate-800" />
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">1 to 10</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Custom Rounds</div>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:border-slate-800" />
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">1-Click</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Decision Memo PDF</div>
              </div>
            </div>
          </div>

          {/* Right: Live Dialectic Animated Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5 space-y-4">
              
              {/* Mockup Window Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 ml-2">
                    live_stress_test.sim
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  Round 2 of 4 • Scalability
                </span>
              </div>

              {/* Mock Topic */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Target Proposal:
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Migrate monolithic Rails e-commerce infrastructure to microservices on AWS EKS.
                </p>
              </div>

              {/* Active Animated Turn */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${activeTurn.color} text-white font-bold text-xs flex items-center justify-center shadow-sm`}>
                      {activeTurn.initials}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block leading-none">
                        {activeTurn.speaker}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Phase: Architectural Scrutiny
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {activeTurn.badge}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200 leading-relaxed shadow-sm">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">
                    [{activeTurn.tag}]
                  </span>
                  {activeTurn.content}
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {MOCK_TURNS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSimulatedTurnIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === simulatedTurnIndex
                        ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                        : 'w-2 bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Institutional-Grade Stress-Testing Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Engineered for engineering leaders, enterprise architects, and executive committees who cannot afford blind spots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <ShieldAlert size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Dual Dialectic Modes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose between <strong>Red-Team Stress-Test</strong> (adversarial cross-examination of premises) and <strong>Collaborative Review</strong> (consensus roadmapping and delivery alignment).
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Cpu size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Cognitive Fallacy Interceptor
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                An integrated Logician agent monitors every debate turn in real time, detecting Slippery Slope, False Dilemma, and Strawman biases before they taint conclusions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                RAG Document Grounding
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload your company's actual architecture RFCs or PRDs (PDF/TXT). Agents cite specific sections to prevent model hallucinations and anchor debates in your reality.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">PolyArguMinds</span>
            <span>•</span>
            <span>Autonomous Executive Decision Arbiter</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGuideModal(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Platform Guide
            </button>
            <span>•</span>
            <button
              onClick={() => setShowAuthModal(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Google Authentication
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={onLaunchDashboard}
      />
      <PlatformGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
};
