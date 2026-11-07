'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { useDebateStream } from '../../../hooks/useDebateStream';
import { useDebateStore } from '../../../stores/debateStore';
import { getSession } from '../../../lib/api';
import { ArenaHeader } from '../../../components/ArenaHeader';
import { AgentBubble } from '../../../components/AgentBubble';
import { InterjectBar } from '../../../components/InterjectBar';
import { DecisionMemoModal } from '../../../components/DecisionMemoModal';

export default function DebateArenaPage() {
  const params = useParams();
  const sessionId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('DEBATE');
  const [showMemoModal, setShowMemoModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    personas,
    turns,
    activeSpeakerId,
    activeSpeakerName,
    currentStreamedText,
    verdict,
    isFinished,
    statusMessage,
    currentRound,
    totalRounds
  } = useDebateStream(sessionId);

  const { updateRound, setPersonas, setTurns, setVerdict } = useDebateStore();

  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId)
      .then((data) => {
        setTopic(data.topic);
        if (data.mode) setMode(data.mode);
        updateRound(data.current_round, data.total_rounds);
        if (data.personas && data.personas.length > 0) {
          setPersonas(data.personas);
        }
        if (data.turns && data.turns.length > 0) {
          setTurns(data.turns);
        }
        if (data.verdict) {
          setVerdict(data.verdict);
          setShowMemoModal(true);
        }
      })
      .catch((err) => console.log('Could not load session', err));

    return () => {
      useDebateStore.getState().reset();
    };
  }, [sessionId]);

  useEffect(() => {
    if (verdict) {
      setShowMemoModal(true);
    }
  }, [verdict]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, currentStreamedText]);

  const agentA = personas.find((p) => p.identifier === 'agent_a');
  const agentB = personas.find((p) => p.identifier === 'agent_b');
  const isCollab = mode === 'COLLABORATIVE';

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col pb-24">
      {/* Top Arena Header */}
      <ArenaHeader
        topic={topic}
        mode={mode}
        currentRound={currentRound}
        totalRounds={totalRounds}
        isFinished={isFinished}
        verdict={verdict}
        onOpenMemo={() => setShowMemoModal(true)}
        statusMessage={statusMessage}
      />

      {/* Main Single Column Feed */}
      <main className="max-w-3xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Personas Spotlight Banner */}
        {personas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {agentA && (
              <div
                className={`p-3.5 rounded-xl border transition ${
                  activeSpeakerId === 'agent_a'
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-400">
                    {isCollab ? 'Lead Strategist' : 'Lead Advocate'}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                    isCollab
                      ? 'text-purple-300 bg-purple-950/60 border-purple-800'
                      : 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                  }`}>
                    {agentA.bias_direction}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">{agentA.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {agentA.core_worldview}
                </p>
              </div>
            )}

            {agentB && (
              <div
                className={`p-3.5 rounded-xl border transition ${
                  activeSpeakerId === 'agent_b'
                    ? 'bg-rose-950/40 border-rose-500 shadow-md ring-1 ring-rose-500/50'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-rose-400">
                    {isCollab ? 'Principal Reviewer' : 'Chief Skeptic'}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                    isCollab
                      ? 'text-sky-300 bg-sky-950/60 border-sky-800'
                      : 'text-rose-400 bg-rose-950/60 border-rose-800'
                  }`}>
                    {agentB.bias_direction}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">{agentB.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {agentB.core_worldview}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State / Initial Loading */}
        {turns.length === 0 && !activeSpeakerId && (
          <div className="text-center py-20">
            <div className="inline-flex p-3 rounded-full bg-slate-900 border border-slate-800 mb-4 animate-pulse">
              <MessageSquare className="text-indigo-400" size={24} />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Initializing Dialectic Analysis</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Synthesizing domain expert personas and framing rigorous logical boundaries...
            </p>
          </div>
        )}

        {/* Turns Stream List */}
        <div className="space-y-6">
          {turns.map((turn) => {
            const persona = personas.find((p) => p.identifier === turn.speaker_id);
            return (
              <AgentBubble
                key={turn.id}
                turn={turn}
                persona={persona}
                mode={mode}
              />
            );
          })}

          {/* Active Streaming Turn */}
          {activeSpeakerId && (
            <AgentBubble
              streaming={{
                speakerId: activeSpeakerId,
                senderName: activeSpeakerName || 'Debater',
                content: currentStreamedText
              }}
              persona={activeSpeakerId === 'agent_a' ? agentA : agentB}
              mode={mode}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Bottom Steering Bar */}
      <InterjectBar sessionId={sessionId} disabled={isFinished} />

      {/* Executive Decision Memo Modal */}
      {showMemoModal && verdict && (
        <DecisionMemoModal
          verdict={verdict}
          topic={topic}
          mode={mode}
          turns={turns}
          onClose={() => setShowMemoModal(false)}
        />
      )}
    </div>
  );
}
