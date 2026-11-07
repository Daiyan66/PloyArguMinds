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

  const { updateRound } = useDebateStore();

  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId)
      .then((data) => {
        setTopic(data.topic);
        if (data.mode) setMode(data.mode);
        updateRound(data.current_round, data.total_rounds);
        if (data.verdict) {
          setShowMemoModal(true);
        }
      })
      .catch((err) => console.log('Could not load session', err));
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
                    {agentA.bias_direction || (isCollab ? 'CAPABILITY' : 'FOR')}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{agentA.name}</h3>
                <p className="text-xs text-slate-400">{agentA.role_title}</p>
              </div>
            )}

            {agentB && (
              <div
                className={`p-3.5 rounded-xl border transition ${
                  activeSpeakerId === 'agent_b'
                    ? isCollab
                      ? 'bg-purple-950/30 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                      : 'bg-rose-950/30 border-rose-500 shadow-md ring-1 ring-rose-500/50'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isCollab ? 'text-purple-400' : 'text-rose-400'}`}>
                    {isCollab ? 'Principal Reviewer' : 'Chief Skeptic'}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                    isCollab
                      ? 'text-purple-300 bg-purple-950/60 border-purple-800'
                      : 'text-rose-400 bg-rose-950/60 border-rose-800'
                  }`}>
                    {agentB.bias_direction || (isCollab ? 'GOVERNANCE' : 'AGAINST')}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{agentB.name}</h3>
                <p className="text-xs text-slate-400">{agentB.role_title}</p>
              </div>
            )}
          </div>
        )}

        {/* Dialectic Transcript */}
        <div className="space-y-4">
          {turns.length === 0 && !currentStreamedText && (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-indigo-400">
                <MessageSquare size={20} />
              </div>
              <p className="text-sm font-medium text-slate-300">
                Initializing {isCollab ? 'Collaborative Review' : 'Red-Team Dialectic'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Synthesizing expert personas and framing {isCollab ? 'constructive design trade-offs' : 'adversarial boundary conditions'}...
              </p>
            </div>
          )}

          {/* Completed Turns */}
          {turns.map((t) => {
            const persona = personas.find((p) => p.identifier === t.speaker_id);
            return <AgentBubble key={t.id} turn={t} persona={persona} mode={mode} />;
          })}

          {/* Currently Streaming Turn */}
          {activeSpeakerId && currentStreamedText && (
            <AgentBubble
              streaming={{
                speakerId: activeSpeakerId,
                senderName: activeSpeakerName || 'Debater',
                content: currentStreamedText
              }}
              persona={personas.find((p) => p.identifier === activeSpeakerId)}
              mode={mode}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Steering Input Bar */}
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
