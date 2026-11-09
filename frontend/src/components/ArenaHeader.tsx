import React, { useState } from 'react';
import Link from 'next/link';
import { Award, ArrowLeft, CheckCircle2, Trash2, Plus, AlertTriangle, X } from 'lucide-react';
import { Verdict } from '../lib/types';
import { ThemeToggle } from './ThemeToggle';

interface ArenaHeaderProps {
  topic: string;
  mode?: string;
  currentRound: number;
  totalRounds: number;
  isFinished: boolean;
  verdict: Verdict | null;
  onOpenMemo: () => void;
  statusMessage: string | null;
  onExtendRounds?: (additional: number) => Promise<void>;
  onDeleteSession?: () => Promise<void>;
}

export const ArenaHeader: React.FC<ArenaHeaderProps> = ({
  topic,
  mode = 'DEBATE',
  currentRound,
  totalRounds,
  isFinished,
  verdict,
  onOpenMemo,
  statusMessage,
  onExtendRounds,
  onDeleteSession
}) => {
  const isCollab = mode === 'COLLABORATIVE';

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [additionalRounds, setAdditionalRounds] = useState<number>(1);
  const [isExtending, setIsExtending] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const maxAddable = Math.max(1, 10 - totalRounds);

  const handleConfirmExtend = async () => {
    if (!onExtendRounds) return;
    setIsExtending(true);
    try {
      await onExtendRounds(additionalRounds);
      setShowExtendModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to extend session');
    } finally {
      setIsExtending(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDeleteSession) return;
    setIsDeleting(true);
    try {
      await onDeleteSession();
    } catch (err: any) {
      alert(err.message || 'Failed to delete session');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Back & Topic */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition shrink-0"
              title="Return Home"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    isCollab
                      ? 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950/60 dark:border-purple-800'
                      : 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-800'
                  }`}
                >
                  {isCollab ? 'Collaborative Review' : 'Red-Team Stress-Test'}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate" title={topic}>
                {topic || (isCollab ? 'Collaborative Review' : 'Dialectic Stress-Test')}
              </h1>
              {statusMessage && (
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate animate-pulse">
                  {statusMessage}
                </p>
              )}
            </div>
          </div>

          {/* Right: Round, Actions, Theme & Decision Memo */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Round Badge */}
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1 rounded-md">
              Round <span className="text-slate-900 dark:text-white font-bold">{Math.min(currentRound, totalRounds)}</span> of {totalRounds}
            </div>

            {/* Active Status Badge */}
            {!isFinished && !verdict ? (
              <span className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium ${
                isCollab
                  ? 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950/40 dark:border-purple-800'
                  : 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isCollab ? 'bg-purple-600 dark:bg-purple-400' : 'bg-amber-600 dark:bg-amber-400'
                }`} />
                <span>{isCollab ? 'Collaborating' : 'Debating'}</span>
              </span>
            ) : (
              <span className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800 flex items-center gap-1 border px-2.5 py-1 rounded-md font-medium">
                <CheckCircle2 size={13} />
                <span className="hidden sm:inline">Concluded</span>
              </span>
            )}

            {/* Resume / Extend Rounds Button */}
            {totalRounds < 10 && onExtendRounds && (
              <button
                onClick={() => setShowExtendModal(true)}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs px-2.5 py-1 rounded-md flex items-center gap-1 transition shadow-sm font-medium"
                title="Resume or add more rounds (max 10 total)"
              >
                <Plus size={13} className="text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Extend</span>
              </button>
            )}

            {/* Decision Memo Button */}
            {verdict && (
              <button
                onClick={onOpenMemo}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3 py-1 rounded-md flex items-center gap-1.5 transition shadow-sm"
              >
                <Award size={14} />
                <span className="hidden sm:inline">Decision Memo</span>
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Delete Session Button */}
            {onDeleteSession && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40"
                title="Delete this chat session"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Extend Rounds Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>Resume & Extend Session</span>
              </h3>
              <button
                onClick={() => setShowExtendModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Continue this {isCollab ? 'collaborative review' : 'dialectic stress-test'} for additional rounds. 
              The agents will pick up from the existing transcript and explore remaining dimensions (Max 10 rounds total).
            </p>
            <div className="mb-5 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex justify-between text-xs mb-2 font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Additional Rounds:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">+{additionalRounds} (New Total: {totalRounds + additionalRounds})</span>
              </div>
              <input
                type="range"
                min={1}
                max={maxAddable}
                value={additionalRounds}
                onChange={(e) => setAdditionalRounds(Number(e.target.value))}
                className="w-full accent-indigo-600 dark:accent-indigo-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                <span>+1 Round</span>
                <span>+{maxAddable} Max (10 Rds Cap)</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExtendModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isExtending}
                onClick={handleConfirmExtend}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 shadow-sm"
              >
                {isExtending ? 'Resuming...' : 'Confirm & Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm mb-2">
              <AlertTriangle size={18} />
              <span>Delete Dialectic Session?</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to permanently delete this session? All turns, transcripts, and evaluation scorecards will be permanently erased.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
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
    </>
  );
};
