import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { MessageTurn, Persona } from '../lib/types';
import { FactCard } from './FactCard';

interface AgentBubbleProps {
  turn?: MessageTurn;
  streaming?: {
    speakerId: string;
    senderName: string;
    content: string;
  };
  persona?: Persona;
  mode?: string;
}

function renderFormattedContent(text: string) {
  if (!text) return null;

  // Split by double line breaks into paragraphs
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className="space-y-3.5">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Check if paragraph is a bullet list
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split(/\n[-*]\s+/).filter(Boolean);
          return (
            <ul key={pIdx} className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-1">
              {items.map((item, iIdx) => (
                <li key={iIdx} className="leading-relaxed">
                  {renderInlineStyled(item.replace(/^[-*]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        // Highlight key structured section headers with distinct colors
        if (trimmed.startsWith('**Core Stance') || trimmed.startsWith('**Core Position')) {
          return (
            <div key={pIdx} className="p-3 rounded-lg bg-amber-950/30 border-l-4 border-amber-400 text-xs sm:text-sm text-slate-200">
              {renderInlineStyled(trimmed)}
            </div>
          );
        }

        if (trimmed.startsWith('**Bottom Line') || trimmed.startsWith('**Executive Conclusion') || trimmed.startsWith('**Takeaway')) {
          return (
            <div key={pIdx} className="p-3 rounded-lg bg-emerald-950/30 border-l-4 border-emerald-400 text-xs sm:text-sm text-slate-200">
              {renderInlineStyled(trimmed)}
            </div>
          );
        }

        if (trimmed.startsWith('**Rebuttal') || trimmed.startsWith('**Counterpoint') || trimmed.startsWith('**Scrutiny')) {
          return (
            <div key={pIdx} className="p-3 rounded-lg bg-rose-950/30 border-l-4 border-rose-400 text-xs sm:text-sm text-slate-200">
              {renderInlineStyled(trimmed)}
            </div>
          );
        }

        if (trimmed.startsWith('**Key Argument') || trimmed.startsWith('**Evidence') || trimmed.startsWith('**Strategic Argument')) {
          return (
            <div key={pIdx} className="p-3 rounded-lg bg-sky-950/30 border-l-4 border-sky-400 text-xs sm:text-sm text-slate-200">
              {renderInlineStyled(trimmed)}
            </div>
          );
        }

        return (
          <p key={pIdx} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {renderInlineStyled(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineStyled(text: string) {
  // Regex match **bold text** and highlight with distinct warm amber color
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const label = part.slice(2, -2);
      // Give key section labels a colored badge look
      if (
        label.includes('Core Stance') ||
        label.includes('Key Argument') ||
        label.includes('Rebuttal') ||
        label.includes('Bottom Line') ||
        label.includes('Evidence')
      ) {
        return (
          <strong key={idx} className="text-amber-300 font-bold uppercase tracking-wider text-[11px] block mb-1">
            {label}
          </strong>
        );
      }
      return (
        <strong key={idx} className="font-semibold text-amber-200 bg-amber-950/40 px-1 py-0.5 rounded">
          {label}
        </strong>
      );
    }
    return part;
  });
}

export const AgentBubble: React.FC<AgentBubbleProps> = ({ turn, streaming, persona, mode = 'DEBATE' }) => {
  const isStreaming = Boolean(streaming);
  const speakerId = turn ? turn.speaker_id : streaming?.speakerId;
  const senderName = turn ? turn.sender_name : streaming?.senderName;
  const roleTitle = turn ? turn.role_title : persona?.role_title || (speakerId === 'moderator' ? 'Moderator' : 'Expert');
  const content = turn ? turn.content : streaming?.content;
  const citations = turn ? turn.citations : [];
  const fallacies = turn ? turn.fallacies : [];

  const isModerator = speakerId === 'moderator';
  const isAgentA = speakerId === 'agent_a';
  const isCollab = mode === 'COLLABORATIVE';

  if (isModerator) {
    let cleanText = (content || '').trim();
    // Strip any legacy boilerplates like 'MODERATOR CONSTRAINT INJECTED: "..."'
    const quotedMatch = cleanText.match(/MODERATOR CONSTRAINT INJECTED:\s*"([^"]+)"/i);
    if (quotedMatch) {
      cleanText = quotedMatch[1];
    } else {
      cleanText = cleanText
        .replace(/^[⚠️\s]*MODERATOR CONSTRAINT INJECTED:\s*/i, '')
        .replace(/\.?\s*Both participants must incorporate this requirement immediately\.?/i, '')
        .replace(/^"|"$/g, '')
        .trim();
    }

    return (
      <div className="my-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-950/20 to-slate-900 border border-amber-500/30 text-xs shadow-md">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400 text-[10px]">
            <ShieldAlert size={13} />
            <span>Human Steering Directive</span>
          </div>
          {turn?.round_number && (
            <span className="text-[9px] font-mono text-amber-400/80 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
              Round {turn.round_number}
            </span>
          )}
        </div>
        <p className="text-amber-100 text-sm font-medium italic pl-1 leading-relaxed">
          &ldquo;{cleanText}&rdquo;
        </p>
      </div>
    );
  }

  const initials = senderName
    ? senderName.split(' ').map((n) => n[0]).slice(0, 2).join('')
    : 'AI';

  // Label based on mode
  const badgeLabel = isCollab
    ? (isAgentA ? 'Lead Strategist' : 'Principal Reviewer')
    : (isAgentA ? 'Lead Advocate' : 'Chief Skeptic');

  return (
    <div className="my-5">
      <div
        className={`rounded-2xl p-5 border transition-all ${
          isAgentA
            ? 'bg-slate-900/90 border-indigo-500/30 shadow-md'
            : isCollab
            ? 'bg-slate-900/70 border-purple-500/30 shadow-md'
            : 'bg-slate-900/60 border-slate-800 shadow-md'
        } ${isStreaming ? 'ring-1 ring-indigo-400/50' : ''}`}
      >
        {/* Speaker Info */}
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow ${
                isAgentA
                  ? 'bg-indigo-600'
                  : isCollab
                  ? 'bg-purple-600'
                  : 'bg-rose-700'
              }`}
            >
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-white">{senderName}</span>
                {turn && (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    Round {turn.round_number}
                  </span>
                )}
                {turn?.phase && turn.phase !== 'CLASH' && turn.phase !== 'FOUNDATION' && turn.phase !== 'THINKING' && (
                  <span className="text-[10px] font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/80 px-2 py-0.5 rounded-md truncate max-w-[220px] sm:max-w-[320px]">
                    {turn.phase}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-normal">
                {roleTitle}
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              isAgentA
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                : isCollab
                ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                : 'bg-rose-950 text-rose-300 border border-rose-800/60'
            }`}
          >
            {badgeLabel}
          </span>
        </div>

        {/* Formatted & Highlighted Content */}
        <div>
          {renderFormattedContent(content || '')}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse align-middle" />
          )}
        </div>

        {/* Grounding Citations */}
        {citations && citations.length > 0 && <FactCard citations={citations} />}

        {/* Fallacy Warnings */}
        {fallacies && fallacies.length > 0 && (
          <div className="mt-3.5 space-y-1.5">
            {fallacies.map((f, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
                <div>
                  <span className="font-bold text-red-400 uppercase tracking-wider mr-1">
                    Logician Note ({f.fallacy_type.replace('_', ' ')}):
                  </span>
                  <span className="text-slate-300">{f.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
