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
  Clock,
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
  const [realSessions, setRealSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Load 100% REAL historical sessions from the backend database (no dummy data)
  useEffect(() => {
    fetch('/api/sessions?limit=6')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setRealSessions(data);
        }
      })
      .catch((err) => console.error('Failed to load real sessions', err))
      .finally(() => setIsLoadingSessions(false));
  }, []);

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

            {/* Google Login Authentication Card */}
            <div className="pt-2">
              {!isAuthenticated ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-w-md mx-auto lg:mx-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Lock size={14} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Enterprise Single Sign-On</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                      Google OAuth Verified
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    Authenticate securely using your genuine Google Account via Google Identity Services.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-[0.99]"
                  >
                    <GoogleLogoIcon className="w-5 h-5" />
                    <span>Sign in with Google</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>✓ Real Google Identity verification</span>
                    <span>✓ Zero password friction</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-md max-w-md mx-auto lg:mx-0 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 size={16} />
                    <span>Authenticated as {user?.name} ({user?.email})</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Your real Google session is active. You have full access to create new stress-tests, inspect active sessions, and download executive memos.
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

            {/* Quick Metrics */}
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

          {/* Right: Real Dialectic Debates From Database */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5 space-y-4">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 ml-1.5 font-medium flex items-center gap-1.5">
                    <Clock size={12} className="text-indigo-500" />
                    <span>Real Platform Evaluations</span>
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Database Verified
                </span>
              </div>

              {/* Real Sessions List from Backend */}
              {isLoadingSessions ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Loading platform sessions...</span>
                </div>
              ) : realSessions.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  No previous sessions in database. Launch your first stress-test above.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {realSessions.map((sess) => (
                    <Link
                      key={sess.id}
                      href={`/debate/${sess.id}`}
                      className="block p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/80 bg-slate-50/70 dark:bg-slate-950/50 hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 transition group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          sess.mode === 'COLLABORATIVE'
                            ? 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950/60 dark:border-purple-800'
                            : 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-800'
                        }`}>
                          {sess.mode === 'COLLABORATIVE' ? 'Collaborative' : 'Red-Team'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {sess.total_rounds || 3} Rounds • {sess.status || 'EVALUATED'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug">
                        {sess.topic}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pipeline Step Overview */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Domain Persona Synthesis</span>
                <span>→</span>
                <span>Adversarial Scrutiny</span>
                <span>→</span>
                <span>Adjudication</span>
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
