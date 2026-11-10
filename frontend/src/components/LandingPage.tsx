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
import { GoogleAuthModal, GoogleLogoIcon } from './GoogleAuthModal';
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-200 relative overflow-hidden">
      
      {/* 3 RADIANT GRADIENT COLORS MOVING TOWARDS RANDOM SPOTS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Gradient Blob 1: Deep Indigo & Electric Blue */}
        <div className="absolute -top-20 -left-20 w-[420px] sm:w-[600px] h-[420px] sm:h-[600px] rounded-full bg-gradient-to-br from-indigo-500/25 via-blue-600/20 to-transparent dark:from-indigo-600/35 dark:via-blue-500/25 dark:to-transparent blur-[90px] animate-blob-1" />
        
        {/* Gradient Blob 2: Vibrant Violet, Purple & Magenta */}
        <div className="absolute top-1/3 -right-20 w-[380px] sm:w-[540px] h-[380px] sm:h-[540px] rounded-full bg-gradient-to-bl from-purple-600/25 via-fuchsia-500/20 to-transparent dark:from-purple-600/35 dark:via-fuchsia-500/25 dark:to-transparent blur-[90px] animate-blob-2" />
        
        {/* Gradient Blob 3: Luminous Cyan, Teal & Emerald */}
        <div className="absolute -bottom-20 left-1/3 w-[400px] sm:w-[560px] h-[400px] sm:h-[560px] rounded-full bg-gradient-to-tr from-cyan-400/20 via-teal-500/18 to-emerald-400/15 dark:from-cyan-500/30 dark:via-teal-400/20 dark:to-emerald-500/20 blur-[90px] animate-blob-3" />
      </div>

      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
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
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold shadow-sm transition"
              >
                <GoogleLogoIcon className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - minimal top spacing from navbar */}
      <section className="relative z-10 pt-4 sm:pt-6 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* HEADING ROW WITH 'LOGIN' BUTTON BESIDE HEADING (RIGHT ON DESKTOP, BELOW ON MOBILE) */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 sm:gap-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] flex-1">
              Stress-test high-stakes decisions{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                before millions
              </span>{' '}
              are on the line.
            </h1>

            {/* Login button: beside heading on desktop (right), below heading on mobile */}
            <div className="shrink-0 self-start md:self-center">
              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <GoogleLogoIcon className="w-4 h-4 bg-white rounded-full p-0.5" />
                  <span>Login</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onLaunchDashboard}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Subtitle description */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-normal">
            Deploy autonomous AI advocates and skeptics to debate both sides of architectural proposals, technical RFCs, and organizational mandates with real-time fallacy checking and neutral executive adjudication.
          </p>

          {/* Two-Column Grid: Highlights / Value Prop & Live Dialectic Simulation Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            
            {/* Left Highlights & Quick Action */}
            <div className="lg:col-span-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldAlert size={15} />
                    <span>Red-Team & Collab</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Dual modes balancing adversarial falsification with collaborative delivery roadmapping.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <Cpu size={15} />
                    <span>Fallacy Interceptor</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Logician engine detects Slippery Slope, False Dilemma, and cognitive biases on the fly.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <FileText size={15} />
                    <span>RFC / PRD Grounding</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Upload documents to anchor bot arguments in verified citations from your actual specs.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Scale size={15} />
                    <span>Decision Memo PDF</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    1-click printable executive report with key takeaways, scorecards, and action plans.
                  </p>
                </div>
              </div>

              {/* Quick Launch / Login CTA Banner */}
              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {isAuthenticated ? `Signed in as ${user?.name}` : 'Google Authentication Required'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAuthenticated ? 'Open your executive workspace to begin testing.' : 'One-click sign in with your Google account.'}
                  </span>
                </div>
                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold shrink-0 transition shadow-sm"
                  >
                    Login
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onLaunchDashboard}
                    className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition shadow-sm"
                  >
                    Open Workspace
                  </button>
                )}
              </div>
            </div>

            {/* Right: Live Dialectic Animated Mockup */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-2xl p-5 space-y-4">
                
                {/* Mockup Window Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 ml-2">
                      live_dialectic_arena.sim
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    Round 2 of 4 • Scalability
                  </span>
                </div>

                {/* Mock Topic Box */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Target Proposal:
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Migrate monolithic Rails e-commerce infrastructure to microservices on AWS EKS.
                  </p>
                </div>

                {/* Active Simulated Turn */}
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

                {/* Simulation Pagination Dots */}
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

          {/* Quick Stats Metrics Banner */}
          <div className="pt-2 flex items-center justify-center sm:justify-start gap-6 sm:gap-10 border-t border-slate-200/80 dark:border-slate-800/80 pt-6">
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
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm text-xs text-slate-500 dark:text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">PolyArguMinds</span>
            <span>•</span>
            <span>Executive Decision Arbiter</span>
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
