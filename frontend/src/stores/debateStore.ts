import { create } from 'zustand';
import { Persona, MessageTurn, Verdict, FallacyAlert } from '../lib/types';

interface DebateStore {
  sessionId: string | null;
  topic: string;
  totalRounds: number;
  currentRound: number;
  personas: Persona[];
  turns: MessageTurn[];
  activeSpeakerId: string | null;
  activeSpeakerName: string | null;
  currentStreamedText: string;
  fallacies: FallacyAlert[];
  verdict: Verdict | null;
  isFinished: boolean;
  statusMessage: string | null;

  setSessionId: (id: string) => void;
  setTopic: (topic: string) => void;
  setPersonas: (personas: Persona[]) => void;
  setTurns: (turns: MessageTurn[]) => void;
  appendTurn: (turn: MessageTurn) => void;
  setActiveSpeaker: (id: string | null, name?: string | null) => void;
  setCurrentStreamedText: (text: string | ((prev: string) => string)) => void;
  addFallacy: (fallacy: FallacyAlert) => void;
  setVerdict: (verdict: Verdict | null) => void;
  setIsFinished: (finished: boolean) => void;
  setStatusMessage: (msg: string | null) => void;
  updateRound: (current: number, total?: number) => void;
  reset: () => void;
}

export const useDebateStore = create<DebateStore>((set) => ({
  sessionId: null,
  topic: '',
  totalRounds: 5,
  currentRound: 1,
  personas: [],
  turns: [],
  activeSpeakerId: null,
  activeSpeakerName: null,
  currentStreamedText: '',
  fallacies: [],
  verdict: null,
  isFinished: false,
  statusMessage: null,

  setSessionId: (id) => set({ sessionId: id }),
  setTopic: (topic) => set({ topic }),
  setPersonas: (personas) => set({ personas }),
  setTurns: (turns) => set({ turns }),
  appendTurn: (turn) => set((state) => ({ turns: [...state.turns, turn] })),
  setActiveSpeaker: (id, name = null) => set({ activeSpeakerId: id, activeSpeakerName: name }),
  setCurrentStreamedText: (updater) =>
    set((state) => ({
      currentStreamedText: typeof updater === 'function' ? updater(state.currentStreamedText) : updater
    })),
  addFallacy: (fallacy) => set((state) => ({ fallacies: [...state.fallacies, fallacy] })),
  setVerdict: (verdict) => set({ verdict, isFinished: !!verdict }),
  setIsFinished: (isFinished) => set({ isFinished }),
  setStatusMessage: (statusMessage) => set({ statusMessage }),
  updateRound: (currentRound, totalRounds) =>
    set((state) => ({
      currentRound,
      totalRounds: totalRounds !== undefined ? totalRounds : state.totalRounds
    })),
  reset: () =>
    set({
      sessionId: null,
      topic: '',
      totalRounds: 5,
      currentRound: 1,
      personas: [],
      turns: [],
      activeSpeakerId: null,
      activeSpeakerName: null,
      currentStreamedText: '',
      fallacies: [],
      verdict: null,
      isFinished: false,
      statusMessage: null
    })
}));
