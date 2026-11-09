import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Citation } from '../lib/types';

interface FactCardProps {
  citations: Citation[];
}

export const FactCard: React.FC<FactCardProps> = ({ citations }) => {
  const [expanded, setExpanded] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3.5 border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl text-xs overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-emerald-800 dark:text-emerald-400 font-medium hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30 transition"
      >
        <span className="flex items-center gap-1.5 font-semibold">
          <BookOpen size={14} />
          <span>Grounding Citations ({citations.length} verified)</span>
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-2 border-t border-emerald-200 dark:border-emerald-500/20 pt-2.5 bg-white/70 dark:bg-slate-950/40">
          {citations.map((c, i) => (
            <div key={i} className="text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
                <FileText size={12} />
                <span>{c.source_title} {c.page_number ? `(Page ${c.page_number})` : ''}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed">
                &ldquo;{c.snippet}&rdquo;
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
