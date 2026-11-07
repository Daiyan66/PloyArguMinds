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
    <div className="mt-3 border border-emerald-500/30 bg-emerald-950/20 rounded-lg text-xs overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-emerald-400 font-medium hover:bg-emerald-900/30 transition"
      >
        <span className="flex items-center gap-1.5">
          <BookOpen size={14} />
          <span>Grounding Citations ({citations.length} verified)</span>
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-emerald-500/20 pt-2 bg-slate-950/40">
          {citations.map((c, i) => (
            <div key={i} className="text-slate-300">
              <div className="flex items-center gap-1 text-emerald-300 font-semibold mb-0.5">
                <FileText size={12} />
                <span>{c.source_title} {c.page_number ? `(Page ${c.page_number})` : ''}</span>
              </div>
              <div className="text-slate-400 italic bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px]">
                &ldquo;{c.snippet}&rdquo;
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
