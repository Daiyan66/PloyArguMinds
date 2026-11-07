import React from 'react';
import Link from 'next/link';
import { Award, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Verdict } from '../lib/types';

interface ArenaHeaderProps {
  topic: string;
  mode?: string;
  currentRound: number;
  totalRounds: number;
  isFinished: boolean;
  verdict: Verdict | null;
  onOpenMemo: () => void;
  statusMessage: string | null;
}

export const ArenaHeader: React.FC<ArenaHeaderProps> = ({
  topic,
  mode = 'DEBATE',
  currentRound,
  totalRounds,
  isFinished,
  verdict,
  onOpenMemo,
  statusMessage
}) => {
  const isCollab = mode === 'COLLABORATIVE';

  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Back & Topic */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            title="Return Home"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                  isCollab
                    ? 'text-purple-400 bg-purple-950/60 border-purple-800'
                    : 'text-indigo-400 bg-indigo-950/60 border-indigo-800'
                }`}
              >
                {isCollab ? 'Design Review' : 'Red-Team'}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white truncate" title={topic}>
              {topic || 'Dialectic Stress-Test'}
            </h1>
            {statusMessage && (
              <p className="text-[11px] text-indigo-400 font-medium truncate animate-pulse">
                {statusMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right: Round & Decision Memo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs text-slate-400 font-medium bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
            Round <span className="text-white font-bold">{Math.min(currentRound, totalRounds)}</span> of {totalRounds}
          </div>

          {verdict ? (
            <button
              onClick={onOpenMemo}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition shadow"
            >
              <Award size={14} />
              <span>Decision Memo</span>
            </button>
          ) : isFinished ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-950/40 border border-emerald-800 px-2.5 py-1 rounded-md">
              <CheckCircle2 size={13} />
              <span>Concluded</span>
            </span>
          ) : (
            <span className="text-xs text-amber-400 flex items-center gap-1 bg-amber-950/40 border border-amber-800 px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Debating</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
