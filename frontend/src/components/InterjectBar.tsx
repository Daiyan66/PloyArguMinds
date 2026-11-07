import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { interjectConstraint } from '../lib/api';

interface InterjectProps {
  sessionId: string;
  onInterjectSubmitted?: () => void;
  disabled?: boolean;
  mode?: string;
}

export const InterjectBar: React.FC<InterjectProps> = ({ 
  sessionId, 
  onInterjectSubmitted, 
  disabled,
  mode = 'DEBATE'
}) => {
  const [constraint, setConstraint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCollab = mode === 'COLLABORATIVE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!constraint.trim() || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      await interjectConstraint(sessionId, constraint.trim());
      setConstraint('');
      if (onInterjectSubmitted) {
        onInterjectSubmitted();
      }
    } catch (err) {
      console.error('Failed to submit interjection', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-[#090d16]/95 backdrop-blur-md border-t border-slate-800/80 z-40">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center gap-2.5">
        <input
          type="text"
          value={constraint}
          onChange={(e) => setConstraint(e.target.value)}
          disabled={disabled}
          placeholder={
            disabled
              ? (isCollab ? "Collaborative review concluded" : "Dialectic stress-test concluded")
              : (isCollab
                  ? "Inject alignment constraint (e.g. 'Must maintain zero-downtime' or 'Cap cloud migration budget')..."
                  : "Inject steering constraint (e.g. 'Must comply with SOC2' or 'Cap cloud budget at 10%')...")
          }
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition"
        />
        <button
          type="submit"
          disabled={isSubmitting || !constraint.trim() || disabled}
          className={`${
            isCollab ? 'bg-purple-600 hover:bg-purple-500' : 'bg-indigo-600 hover:bg-indigo-500'
          } disabled:opacity-30 text-white font-medium p-2.5 sm:px-4 sm:py-2.5 rounded-xl flex items-center gap-1.5 transition text-xs shrink-0`}
        >
          <Send size={15} />
          <span className="hidden sm:inline">Steer</span>
        </button>
      </form>
    </div>
  );
};
