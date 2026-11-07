'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageSquare, Plus, CheckCircle2 } from 'lucide-react';
import { useDebateStream } from '../../../hooks/useDebateStream';
import { useDebateStore } from '../../../stores/debateStore';
import { getSession, extendRounds, deleteSession } from '../../../lib/api';
import { ArenaHeader } from '../../../components/ArenaHeader';
import { AgentBubble } from '../../../components/AgentBubble';
import { InterjectBar } from '../../../components/InterjectBar';
import { DecisionMemoModal } from '../../../components/DecisionMemoModal';

export default function DebateArenaPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('DEBATE');
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [reconnectKey, setReconnectKey] = useState(0);
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
  } = useDebateStream(sessionId, reconnectKey);

  const { updateRound, setPersonas, setTurns, setVerdict, setIsFinished } = useDebateStore();

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
  }, [sessionId, reconnectKey]);

  useEffect(() => {
    if (verdict) {
      setShowMemoModal(true);
    }
  }, [verdict]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, currentStreamedText]);

  const handleExtendRounds = async (additional: number) => {
    try {
      const res = await extendRounds(sessionId, additional);
      updateRound(res.current_round, res.total_rounds);
      setIsFinished(false);
      setVerdict(null);
      setReconnectKey((prev) => prev + 1);
    } catch (err: any) {
      alert(err.message || 'Failed to extend session');
    }
  };

  const handleDeleteSession = async () => {
    try {
      await deleteSession(sessionId);
      useDebateStore.getState().reset();
      router.push('/');
    } catch (err: any) {
      alert(err.message || 'Failed to delete session');
    }
  };

  const agentA = personas.find((p) => p.identifier === 'agent_a');
  const agentB = personas.find((p) => p.identifier === 'agent_b');
  const isCollab = mode === 'COLLABORATIVE';

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col pb-28">
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
        onExtendRounds={handleExtendRounds}
        onDeleteSession={handleDeleteSession}
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
            <h3 className="text-base font-semibold text-white mb-1">
              {isCollab ? 'Initializing Collaborative Review' : 'Initializing Dialectic Analysis'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Synthesizing domain expert personas and mapping aspect agendas across rounds...
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

          {/* Session Concluded & Extend Action Banner */}
          {isFinished && totalRounds < 10 && (
            <div className="mt-8 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5 text-xs text-slate-300 text-center sm:text-left">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">
                    {isCollab ? 'Review Completed' : 'Debate Concluded'} ({totalRounds} of {totalRounds} Rounds)
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Want to stress-test additional operational aspects? Resume and extend this chat (max 10 rounds).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExtendRounds(1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1"
                >
                  <Plus size={13} className="text-indigo-400" />
                  <span>+1 Round</span>
                </button>
                {totalRounds <= 8 && (
                  <button
                    onClick={() => handleExtendRounds(2)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition flex items-center gap-1 shadow-md shadow-indigo-600/25"
                  >
                    <Plus size={13} />
                    <span>+2 Rounds</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Bottom Steering Bar */}
      <InterjectBar sessionId={sessionId} disabled={isFinished} mode={mode} />

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
