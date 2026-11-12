'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  Search,
  Filter,
  Tag,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { createSession, uploadDocument, deleteSession } from '../../lib/api';
import { useDebateStore } from '../../stores/debateStore';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogoIcon } from '../../components/GoogleAuthModal';
import { PlatformGuideModal } from '../../components/PlatformGuideModal';

const PRESET_TOPICS = [
  "Enforce a mandatory 3-day in-office RTO mandate across all engineering teams.",
  "Migrate monolithic Rails e-commerce infrastructure to microservices on AWS EKS.",
  "Adopt Rust over Go for all new performance-critical platform networking services.",
  "Replace customer support tier 1 with autonomous agentic LLM workflows."
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, initiateGoogleLogin } = useAuth();
  
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

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'DEBATE' | 'COLLABORATIVE'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  // Topic classification helper
  const inferTopicTags = (topicText: string): string[] => {
    if (!topicText) return ['General'];
    const text = topicText.toLowerCase();
    const tags: string[] = [];
    if (text.includes('microservice') || text.includes('monolith') || text.includes('architecture') || text.includes('aws') || text.includes('eks') || text.includes('cloud')) {
      tags.push('Architecture');
    }
    if (text.includes('rust') || text.includes('go') || text.includes('python') || text.includes('code') || text.includes('engineering') || text.includes('platform')) {
      tags.push('Engineering');
    }
    if (text.includes('llm') || text.includes('ai') || text.includes('agent') || text.includes('agentic') || text.includes('gpt') || text.includes('model')) {
      tags.push('AI & ML');
    }
    if (text.includes('rto') || text.includes('office') || text.includes('mandate') || text.includes('team') || text.includes('policy') || text.includes('work')) {
      tags.push('Policy');
    }
    if (text.includes('security') || text.includes('auth') || text.includes('governance') || text.includes('compliance')) {
      tags.push('Security');
    }
    if (tags.length === 0) {
      tags.push('Strategy');
    }
    return tags;
  };

  // Human-readable relative timestamp helper
  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Derive unique tags from user sessions
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    recentSessions.forEach((s) => {
      inferTopicTags(s.topic).forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [recentSessions]);

  // Filtered session list based on search, mode, status, and tag
  const filteredSessions = useMemo(() => {
    return recentSessions.filter((s) => {
      // 1. Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTopic = s.topic?.toLowerCase().includes(q);
        const matchesTags = inferTopicTags(s.topic).some((t) => t.toLowerCase().includes(q));
        if (!matchesTopic && !matchesTags) return false;
      }

      // 2. Mode match
      if (filterMode !== 'ALL' && s.mode !== filterMode) {
        return false;
      }

      // 3. Status match
      if (filterStatus !== 'ALL') {
        const sStatus = s.status || 'ACTIVE';
        if (sStatus !== filterStatus) return false;
      }

      // 4. Tag match
      if (selectedTag !== 'ALL') {
        const tags = inferTopicTags(s.topic);
        if (!tags.includes(selectedTag)) return false;
      }

      return true;
    });
  }, [recentSessions, searchQuery, filterMode, filterStatus, selectedTag]);

  const hasActiveFilters = searchQuery.trim() !== '' || filterMode !== 'ALL' || filterStatus !== 'ALL' || selectedTag !== 'ALL';

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterMode('ALL');
    setFilterStatus('ALL');
    setSelectedTag('ALL');
  };

  const fetchRecent = (currentUserId?: string) => {
    const uid = currentUserId || user?.id;
    const query = uid ? `?user_id=${encodeURIComponent(uid)}&limit=15` : '?limit=15';
    fetch(`/api/sessions${query}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRecentSessions(data))
      .catch(() => {});
  };

  useEffect(() => {
    if (user?.id) {
      fetchRecent(user.id);
    } else {
      fetchRecent();
    }
  }, [user?.id]);

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
      initiateGoogleLogin();
      return;
    }

    setIsSubmitting(true);
    try {
      useDebateStore.getState().reset();
      const sess = await createSession(topic.trim(), mode, totalRounds, user?.id);
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
                onClick={() => initiateGoogleLogin()}
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

            {/* Recent Sessions List with Live Search, Filter & Tagging */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Evaluations & Debates
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {filteredSessions.length} {filteredSessions.length === 1 ? 'debate' : 'debates'}
                  </span>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 self-start sm:self-auto"
                  >
                    <RotateCcw size={11} />
                    <span>Reset filters</span>
                  </button>
                )}
              </div>

              {/* SEARCH & FILTERS CONTROLS */}
              <div className="space-y-3">
                {/* 1. Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by topic, keyword, or tag..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* 2. Filter Pills Row: Mode & Status */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Mode Pills */}
                  <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setFilterMode('ALL')}
                      className={`px-2 py-1 rounded-md font-medium transition ${
                        filterMode === 'ALL'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      All Modes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('DEBATE')}
                      className={`px-2 py-1 rounded-md font-medium transition ${
                        filterMode === 'DEBATE'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Red-Team
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('COLLABORATIVE')}
                      className={`px-2 py-1 rounded-md font-medium transition ${
                        filterMode === 'COLLABORATIVE'
                          ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Collaborative
                    </button>
                  </div>

                  {/* Status Pills */}
                  <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setFilterStatus('ALL')}
                      className={`px-2 py-1 rounded-md font-medium transition ${
                        filterStatus === 'ALL'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      All Status
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('ACTIVE')}
                      className={`px-2 py-1 rounded-md font-medium transition ${
                        filterStatus === 'ACTIVE'
                          ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('COMPLETED')}
                      className={`px-2 py-1 rounded-md font-medium transition ${
                        filterStatus === 'COMPLETED'
                          ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                {/* 3. Category Tags Row */}
                {availableTags.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    <span className="text-slate-400 shrink-0 flex items-center gap-1 font-medium text-[10px] uppercase tracking-wider">
                      <Tag size={11} />
                      <span>Topic:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTag('ALL')}
                      className={`px-2 py-0.5 rounded-full shrink-0 border transition ${
                        selectedTag === 'ALL'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      All
                    </button>
                    {availableTags.map((tagName) => (
                      <button
                        key={tagName}
                        type="button"
                        onClick={() => setSelectedTag(selectedTag === tagName ? 'ALL' : tagName)}
                        className={`px-2 py-0.5 rounded-full shrink-0 border transition ${
                          selectedTag === tagName
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        #{tagName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* LIST OF SESSIONS */}
              {recentSessions.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  No sessions evaluated yet. Start your first dialectic stress-test above.
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No debates found matching <span className="font-semibold text-slate-700 dark:text-slate-200">"{searchQuery || selectedTag}"</span>
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-medium text-xs transition"
                  >
                    <RotateCcw size={12} />
                    <span>Clear all filters</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredSessions.map((s) => {
                    const tags = inferTopicTags(s.topic);
                    const isCompleted = s.status === 'COMPLETED';
                    const relativeTime = formatRelativeTime(s.created_at);

                    return (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900/80 flex items-center justify-between gap-3 transition group shadow-xs"
                      >
                        <Link
                          href={`/debate/${s.id}`}
                          className="min-w-0 flex-1 flex items-start gap-2.5"
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                              isCompleted ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                            }`}
                            title={isCompleted ? 'Completed' : 'Active'}
                          />
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug">
                              {s.topic}
                            </p>
                            
                            {/* Badges & Meta Row */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              {/* Mode Badge */}
                              <span
                                className={`px-1.5 py-0.5 rounded font-medium ${
                                  s.mode === 'COLLABORATIVE'
                                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60'
                                }`}
                              >
                                {s.mode === 'COLLABORATIVE' ? 'Collaborative' : 'Red-Team'}
                              </span>

                              {/* Rounds Badge */}
                              <span className="font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {s.total_rounds || 3} Rds
                              </span>

                              {/* Inferred Topic Tags */}
                              {tags.slice(0, 2).map((t) => (
                                <span
                                  key={t}
                                  className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded"
                                >
                                  #{t}
                                </span>
                              ))}

                              {/* Relative Timestamp */}
                              {relativeTime && (
                                <span className="text-slate-400 dark:text-slate-500 font-mono ml-auto">
                                  {relativeTime}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>

                        <div className="flex items-center gap-1.5 shrink-0 self-center">
                          <Link
                            href={`/debate/${s.id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-medium text-slate-700 dark:text-slate-300 transition shadow-xs"
                          >
                            Open
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSessionToDelete({ id: s.id, topic: s.topic })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete session"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
      <PlatformGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
