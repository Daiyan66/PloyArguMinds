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
  Sparkles,
  Sliders,
  X,
  FileText,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { createSession, uploadDocument, deleteSession } from '../lib/api';
import { useDebateStore } from '../stores/debateStore';

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
      alert('Could not start stress-test session. Please check backend connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 px-6 py-4 bg-[#080c14]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-base shadow-md shadow-indigo-600/30">
              PA
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
                PolyArguMinds
              </span>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                Autonomous Dialectic Engine
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full font-medium shadow-sm">
            Executive Decision Arbiter
          </span>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR: Features & Configuration (File upload, Mode, Rounds) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Mode Selection */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                1. Select Dialectic Mode
              </label>
              <div className="space-y-2.5">
                {/* Mode 1: Red-Team Debate */}
                <button
                  type="button"
                  onClick={() => setMode('DEBATE')}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                    mode === 'DEBATE'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase text-indigo-400">
                      <ShieldAlert size={15} />
                      <span>Red-Team Stress-Test</span>
                    </div>
                    {mode === 'DEBATE' && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Adversarial red-team clash exposing vulnerabilities, hidden cost hazards, and unverified assumptions.
                  </p>
                </button>

                {/* Mode 2: Collaborative Review */}
                <button
                  type="button"
                  onClick={() => setMode('COLLABORATIVE')}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                    mode === 'COLLABORATIVE'
                      ? 'bg-purple-950/60 border-purple-500 text-white shadow-md ring-1 ring-purple-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase text-purple-400">
                      <Users size={15} />
                      <span>Collaborative Review</span>
                    </div>
                    {mode === 'COLLABORATIVE' && (
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Constructive peer architecture review balancing capability, operational governance, and consensus roadmap.
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Custom Rounds */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sliders size={14} className="text-indigo-400" />
                  <span>2. Argumentation Depth</span>
                </label>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800">
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
                  className="flex-1 accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                  className="w-14 bg-slate-950 border border-slate-700 rounded-lg py-1 text-center text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>1 Round (Rapid)</span>
                <span>3 Rounds (Standard)</span>
                <span>10 Rounds (Exhaustive)</span>
              </div>
            </div>

            {/* 3. Document Upload (PDF / TXT) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                3. Reference Document (RAG Grounding)
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Upload architecture diagrams, PRDs, or budget sheets for verified citations.
              </p>
              {file ? (
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-emerald-500/30 text-xs text-emerald-400">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck size={16} className="shrink-0" />
                    <span className="truncate font-medium">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-slate-400 hover:text-white ml-2 p-1 rounded hover:bg-slate-800 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-950 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-xs text-slate-400 hover:text-slate-200 transition">
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="hidden"
                  />
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-indigo-400">
                    <Upload size={18} />
                  </div>
                  <span className="font-medium text-slate-300">Click to upload RFC / PRD (PDF, TXT)</span>
                  <span className="text-[10px] text-slate-500">Agents cite page numbers and figures via vector lookup</span>
                </label>
              )}
            </div>
          </div>

          {/* RIGHT MAIN AREA: Topic Prompt + Launch Button + Chat History below */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            {/* Topic Input Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Strategic Topic or Executive Proposal
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Mode: <strong className={mode === 'COLLABORATIVE' ? 'text-purple-400' : 'text-indigo-400'}>
                      {mode === 'COLLABORATIVE' ? 'Collaborative Review' : 'Red-Team Stress-Test'}
                    </strong>
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Enforce a mandatory 3-day in-office RTO mandate across all engineering teams, capping remote exceptions at 5%..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition leading-relaxed resize-none mb-3"
                  required
                />

                {/* Example Pills */}
                <div className="mb-4">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                    Quick Strategic Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TOPICS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTopic(preset)}
                        className="text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition text-left"
                      >
                        {preset.length > 55 ? `${preset.slice(0, 55)}...` : preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || !topic.trim()}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white transition shadow-lg ${
                  mode === 'COLLABORATIVE'
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/25'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                } disabled:opacity-40`}
              >
                {isSubmitting ? (
                  <span>Synthesizing Expert Personas & Launching Arena...</span>
                ) : (
                  <>
                    <span>
                      Launch {mode === 'COLLABORATIVE' ? 'Collaborative Review' : 'Red-Team Stress-Test'} ({totalRounds} Rounds)
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Chat History / Recent Sessions below */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock size={14} className="text-indigo-400" />
                  <span>Session History & Transcripts</span>
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {recentSessions.length} recorded
                </span>
              </div>

              {recentSessions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-500 text-xs">
                  <FileText size={24} className="mb-2 text-slate-600" />
                  <p>No prior dialectic sessions recorded.</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
                  {recentSessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        useDebateStore.getState().reset();
                        router.push(`/debate/${s.id}`);
                      }}
                      className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 cursor-pointer transition flex items-center justify-between text-xs group"
                    >
                      <div className="min-w-0 pr-3">
                        <h4 className="text-slate-200 font-semibold truncate group-hover:text-indigo-300 transition">
                          {s.topic}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                              s.mode === 'COLLABORATIVE'
                                ? 'text-purple-400 bg-purple-950/50 border-purple-800'
                                : 'text-indigo-400 bg-indigo-950/50 border-indigo-800'
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
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition"
                          title="Delete session"
                        >
                          <Trash2 size={14} />
                        </button>
                        <ArrowRight size={15} className="text-slate-500 group-hover:text-white shrink-0 transition" />
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-900/40 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
              <AlertTriangle size={18} />
              <span>Delete Dialectic Session?</span>
            </div>
            <p className="text-xs text-slate-300 mb-1 leading-relaxed">
              Are you sure you want to permanently delete:
            </p>
            <p className="text-xs text-white font-medium bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-4 line-clamp-2">
              "{sessionToDelete.topic}"
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSessionToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 shadow-md shadow-rose-600/30"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-3.5 text-center text-xs text-slate-600">
        PolyArguMinds • Autonomous Dialectic Intelligence & Decision Arbiter
      </footer>
    </div>
  );
}
