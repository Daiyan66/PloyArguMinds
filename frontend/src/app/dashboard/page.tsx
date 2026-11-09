'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  ArrowRight,
  Upload,
  FileCheck,
  Clock,
  Sliders,
  X,
  FileText,
  Trash2,
  AlertTriangle,
  BookOpen,
  LogOut,
  Sparkles
} from 'lucide-react';
import { createSession, uploadDocument, deleteSession } from '../../lib/api';
import { useDebateStore } from '../../stores/debateStore';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthModal, GoogleLogoIcon } from '../../components/GoogleAuthModal';
import { PlatformGuideModal } from '../../components/PlatformGuideModal';

const PRESET_TOPICS = [
  "Enforce a mandatory 3-day in-office RTO mandate across all engineering teams.",
  "Migrate monolithic Rails e-commerce infrastructure to microservices on AWS EKS.",
  "Adopt Rust over Go for all new performance-critical platform networking services.",
  "Replace customer support tier 1 with autonomous agentic LLM workflows."
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'DEBATE' | 'COLLABORATIVE'>('DEBATE');
  const [totalRounds, setTotalRounds] = useState<number>(3);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; topic: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const fetchRecent = () => {
    fetch('/api/sessions?limit=8')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRecentSessions(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSession(sessionToDelete.id);
      setRecentSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
      setSessionToDelete(null);
    } catch (err) {
      alert('Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      useDebateStore.getState().reset();
      const sess = await createSession(topic.trim(), mode, totalRounds);
      if (file) {
        await uploadDocument(sess.id, file);
      }
      router.push(`/debate/${sess.id}`);
    } catch (err) {
      console.error('Launch failed:', err);
      alert('Could not start session. Please check backend connection.');
      setIsSubmitting(false);
    }
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
    : 'G';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Header with Platform Guide & Google Auth Controls */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-sm group-hover:scale-105 transition">
                PA
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-none">
                  PolyArguMinds
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Dialectic Workspace & Executive Arbiter
                </span>
              </div>
            </Link>
          </div>
          
          {/* Right Actions: Platform Guide Button, Theme Toggle, Google User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* PLATFORM GUIDE BUTTON */}
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-sm active:scale-[0.98]"
              title="View detailed features and instructions about the whole platform"
            >
              <BookOpen size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Platform Guide</span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Google Authentication Profile Chip */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {userInitials}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-sm transition"
              >
                <GoogleLogoIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Google Sign-In</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Configuration (Mode, Rounds, RAG file) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Mode Selection */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                1. Dialectic Mode
              </label>
              <div className="space-y-2.5">
                {/* Red-Team Debate */}
                <button
                  type="button"
                  onClick={() => setMode('DEBATE')}
                  className={`w-full p-3.5 rounded-lg border text-left transition-all ${
                    mode === 'DEBATE'
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-indigo-400/30'
                      : 'bg-slate-50/60 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-semibold text-xs text-indigo-700 dark:text-indigo-400">
                      <ShieldAlert size={15} />
                      <span>Red-Team Stress-Test</span>
                    </div>
                    {mode === 'DEBATE' && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                    Adversarial tension challenging core premises, exposing operational risks, and checking logic.
                  </p>
                </button>

                {/* Collaborative Review */}
                <button
                  type="button"
                  onClick={() => setMode('COLLABORATIVE')}
                  className={`w-full p-3.5 rounded-lg border text-left transition-all ${
                    mode === 'COLLABORATIVE'
                      ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-400 dark:border-purple-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-purple-400/30'
                      : 'bg-slate-50/60 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-semibold text-xs text-purple-700 dark:text-purple-400">
                      <Users size={15} />
                      <span>Collaborative Review</span>
                    </div>
                    {mode === 'COLLABORATIVE' && (
                      <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                    Constructive architecture review balancing delivery velocity, governance, and consensus roadmap.
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Custom Rounds */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sliders size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>2. Argumentation Depth</span>
                </label>
                <span className="text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60">
                  {totalRounds} Rounds ({totalRounds * 2} Turns)
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                  className="flex-1 accent-indigo-600 dark:accent-indigo-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                  className="w-14 text-center py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Each round maps to a structured aspect agenda (1 to 10 rounds max).
              </p>
            </div>

            {/* 3. Reference Context Document Upload (RAG) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                3. Reference Context (Optional)
              </label>
              {!file ? (
                <label className="border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/50 transition">
                  <Upload size={20} className="text-slate-400 mb-1.5" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Upload RFC or PRD (PDF/TXT)
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Ground arguments in company-specific technical specs
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setFile(e.target.files[0]);
                    }}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 truncate">
                      {file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Proposal Input & History */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Proposal Input Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Proposal or High-Stakes Decision Topic
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={4}
                required
                placeholder="e.g. Adopt Rust over Go for all new performance-critical platform networking services..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
              />

              {/* Quick Preset Topics */}
              <div className="mt-3">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                  Or load an executive prompt:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TOPICS.map((pt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(pt)}
                      className="text-left text-[11px] bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md transition text-slate-700 dark:text-slate-300 truncate max-w-full"
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isAuthenticated ? (
                    <span>Ready to launch as <strong>{user?.name}</strong></span>
                  ) : (
                    <span>Google sign-in required to launch</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !topic.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2 shadow-sm"
                >
                  <span>{isSubmitting ? 'Initializing Agents...' : 'Begin Stress-Test'}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Recent Sessions List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Recent Evaluations & Debates</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {recentSessions.length} total
                </span>
              </div>

              {recentSessions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  No sessions evaluated yet. Start your first dialectic stress-test above.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentSessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3 transition group"
                    >
                      <Link
                        href={`/debate/${s.id}`}
                        className="min-w-0 flex-1 flex items-center gap-2.5"
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            s.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {s.topic}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {s.mode === 'COLLABORATIVE' ? 'Collaborative' : 'Red-Team'} • {s.total_rounds || 3} Rds
                            </span>
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/debate/${s.id}`}
                          className="px-2.5 py-1 rounded bg-slate-200/70 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSessionToDelete({ id: s.id, topic: s.topic })}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete session"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span>PolyArguMinds • Autonomous Dialectic Stress-Testing Engine</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGuideModal(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Platform Guide & Docs
            </button>
            <Link href="/" className="hover:underline">
              Landing Page
            </Link>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm mb-2">
              <AlertTriangle size={18} />
              <span>Delete Dialectic Session?</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Are you sure you want to delete <strong>&ldquo;{sessionToDelete.topic}&rdquo;</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSessionToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 shadow-sm"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <PlatformGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
