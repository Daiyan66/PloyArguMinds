'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass, ShieldAlert, Sparkles, Home, BookOpen, Search } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { PlatformGuideModal } from '../components/PlatformGuideModal';

export default function NotFoundPage() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-sm group-hover:scale-105 transition">
              PA
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-none">
                PolyArguMinds
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Dialectic Stress-Testing Engine
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGuide(true)}
              className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition"
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">Platform Guide</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        {/* Animated Dialectic Radar Graphic */}
        <div className="relative mb-8">
          {/* Subtle pulsating outer glow */}
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-2xl animate-pulse-glow" />
          
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 flex items-center justify-center animate-spin-slow">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-indigo-200 dark:border-indigo-900/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center shadow-lg">
              <Compass className="text-indigo-600 dark:text-indigo-400 animate-float" size={48} />
            </div>
          </div>

          <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-[10px] font-mono font-bold text-rose-700 dark:text-rose-400 shadow-sm animate-bounce">
            LOST_VECTOR
          </div>
        </div>

        {/* 404 Label & Code */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 mb-3">
          <ShieldAlert size={14} />
          <span>STATUS CODE: 404 • UNRESOLVED ARGUMENT</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
          Dialectic Void Detected
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
          The debate session, turn transcript, or system coordinate you navigated to does not exist or has been permanently synthesized into the void.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-[0.98]"
          >
            <ArrowLeft size={16} />
            <span>Return to Workspace</span>
          </Link>

          <button
            onClick={() => setShowGuide(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span>Open Platform Guide</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-5 text-center text-xs text-slate-400">
        <p>PolyArguMinds Autonomous Dialectic Engine • High-Consequence Decision Arbiter</p>
      </footer>

      {/* Guide Modal */}
      <PlatformGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
