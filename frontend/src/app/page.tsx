'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  AlertTriangle
} from 'lucide-react';
import { createSession, uploadDocument, deleteSession } from '../lib/api';
import { useDebateStore } from '../stores/debateStore';
import { ThemeToggle } from '../components/ThemeToggle';

const PRESET_TOPICS = [
  "Enforce a mandatory 3-day in-office RTO mandate across all engineering teams.",
  "Migrate monolithic Rails e-commerce infrastructure to microservices on AWS EKS.",
  "Adopt Rust over Go for all new performance-critical platform networking services.",
  "Replace customer support tier 1 with autonomous agentic LLM workflows."
];

export default function HomePage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'DEBATE' | 'COLLABORATIVE'>('DEBATE');
  const [totalRounds, setTotalRounds] = useState<number>(3);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; topic: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 transition-colors">
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
                Dialectic Stress-Testing & Decision Arbiter
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-md font-medium">
              Enterprise Evaluation Engine
            </span>
            <ThemeToggle />
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
                  className="w-14 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg py-1 text-center text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>1 Round (Rapid)</span>
                <span>3 Rounds (Standard)</span>
                <span>10 Rounds (Max)</span>
              </div>
            </div>

            {/* 3. Document Upload (PDF / TXT) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                3. Reference Context (Optional)
              </label>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Upload architecture RFC, PRD, or budget sheet for grounded citations.
              </p>
              {file ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-300 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="truncate font-medium">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white ml-2 p-1 rounded transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 rounded-lg p-4 text-xs text-slate-600 dark:text-slate-400 transition">
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="hidden"
                  />
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm">
                    <Upload size={16} />
                  </div>
                  <span className="font-medium text-slate-800 dark:text-slate-300">Upload RFC or PRD document</span>
                  <span className="text-[10px] text-slate-500">PDF, TXT, or Markdown</span>
                </label>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Topic Prompt + Presets + History */}
          <div className="lg:col-span-7 space-y-6">
            {/* Topic Input Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Strategic Topic or Proposal
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Mode: <strong className={mode === 'COLLABORATIVE' ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'}>
                    {mode === 'COLLABORATIVE' ? 'Collaborative Review' : 'Red-Team Stress-Test'}
                  </strong>
                </span>
              </div>
              
              <textarea
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Enforce a mandatory 3-day in-office RTO mandate across all engineering teams, capping remote exceptions at 5%..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition leading-relaxed resize-none mb-3"
                required
              />

              {/* Presets */}
              <div className="mb-5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                  Sample Scenarios:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TOPICS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(preset)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-md transition text-left"
                    >
                      {preset.length > 55 ? `${preset.slice(0, 52)}...` : preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || !topic.trim()}
                className={`w-full py-3.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold text-white transition shadow-sm ${
                  mode === 'COLLABORATIVE'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <span>Initializing Dialectic Arena...</span>
                ) : (
                  <>
                    <span>
                      Begin {mode === 'COLLABORATIVE' ? 'Collaborative Review' : 'Stress-Test'} ({totalRounds} Rounds)
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Session History */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Session History & Transcripts</span>
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {recentSessions.length} recorded
                </span>
              </div>

              {recentSessions.length === 0 ? (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                  <FileText size={22} className="mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                  <p>No prior dialectic sessions recorded.</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
                  {recentSessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        useDebateStore.getState().reset();
                        router.push(`/debate/${s.id}`);
                      }}
                      className="p-3 rounded-lg bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800/80 cursor-pointer transition flex items-center justify-between text-xs group"
                    >
                      <div className="min-w-0 pr-3">
                        <h4 className="text-slate-800 dark:text-slate-200 font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {s.topic}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                              s.mode === 'COLLABORATIVE'
                                ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
                                : 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                            }`}
                          >
                            {s.mode || 'DEBATE'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {s.total_rounds} Rounds • {s.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionToDelete({ id: s.id, topic: s.topic });
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition"
                          title="Delete session"
                        >
                          <Trash2 size={14} />
                        </button>
                        <ArrowRight size={15} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white shrink-0 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </main>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-xl">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm mb-2">
              <AlertTriangle size={18} />
              <span>Delete Session?</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
              Are you sure you want to permanently delete:
            </p>
            <p className="text-xs text-slate-900 dark:text-white font-medium bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mb-4 line-clamp-2">
              "{sessionToDelete.topic}"
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSessionToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 shadow-sm"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Human Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        PolyArguMinds • Autonomous Dialectic Intelligence & Decision Arbiter
      </footer>
    </div>
  );
}
