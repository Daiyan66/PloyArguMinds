import React from 'react';
import { AlertOctagon, HelpCircle } from 'lucide-react';
import { FallacyAlert } from '../lib/types';

interface FallacyBadgeProps {
  fallacy: FallacyAlert;
}

export const FallacyBadge: React.FC<FallacyBadgeProps> = ({ fallacy }) => {
  return (
    <div className="mt-2.5 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs shadow-inner">
      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-red-400 mb-1">
        <AlertOctagon size={14} className="text-red-400 animate-pulse" />
        <span>Referee Flag: {fallacy.fallacy_type.replace('_', ' ')}</span>
      </div>
      {fallacy.quote && (
        <div className="italic text-slate-300 border-l-2 border-red-500/50 pl-2 my-1">
          &ldquo;{fallacy.quote}&rdquo;
        </div>
      )}
      <div className="text-slate-300 flex items-start gap-1">
        <HelpCircle size={13} className="shrink-0 mt-0.5 text-red-400/80" />
        <span>{fallacy.explanation}</span>
      </div>
    </div>
  );
};
