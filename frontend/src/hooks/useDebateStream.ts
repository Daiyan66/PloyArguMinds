import { useEffect, useRef } from 'react';
import { useDebateStore } from '../stores/debateStore';
import { MessageTurn, FallacyAlert } from '../lib/types';

export function useDebateStream(sessionId: string) {
  const {
    setPersonas,
    appendTurn,
    setActiveSpeaker,
    setCurrentStreamedText,
    addFallacy,
    setVerdict,
    setIsFinished,
    setStatusMessage,
    updateRound,
    personas,
    turns,
    activeSpeakerId,
    activeSpeakerName,
    currentStreamedText,
    fallacies,
    verdict,
    isFinished,
    statusMessage,
    currentRound,
    totalRounds
  } = useDebateStore();

  const currentSpeakerRef = useRef<{ id: string; name: string; round: number; phase: string } | null>(null);
  const accumulatedTextRef = useRef<string>('');
  const currentTurnFallaciesRef = useRef<FallacyAlert[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    // Reset Zustand store state for new session ID to prevent old chats concatenating
    useDebateStore.getState().reset();
    useDebateStore.getState().setSessionId(sessionId);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const streamUrl = `${apiBase}/api/sessions/${sessionId}/stream`;
    console.log('Connecting to SSE stream:', streamUrl);
    const eventSource = new EventSource(streamUrl);

    eventSource.addEventListener('status', (e) => {
      try {
        const data = JSON.parse(e.data);
        setStatusMessage(data.message);
      } catch (err) {
        console.error('Error parsing status event', err);
      }
    });

    eventSource.addEventListener('error', (e: any) => {
      try {
        if (e.data) {
          const errData = JSON.parse(e.data);
          setStatusMessage(`Stream Error: ${errData.error || 'Connection failed'}`);
        }
      } catch (_) {}
    });

    eventSource.addEventListener('personas_ready', (e) => {
      try {
        const data = JSON.parse(e.data);
        setPersonas(data);
        setStatusMessage(null);
      } catch (err) {
        console.error('Error parsing personas_ready', err);
      }
    });

    eventSource.addEventListener('turn_start', (e) => {
      try {
        const data = JSON.parse(e.data);
        currentSpeakerRef.current = {
          id: data.speaker_id,
          name: data.name,
          round: data.round || 1,
          phase: data.phase || 'CLASH'
        };
        accumulatedTextRef.current = '';
        currentTurnFallaciesRef.current = [];
        setActiveSpeaker(data.speaker_id, data.name);
        setCurrentStreamedText('');
        updateRound(data.round || 1);
        setStatusMessage(null);
      } catch (err) {
        console.error('Error in turn_start', err);
      }
    });

    eventSource.addEventListener('token', (e) => {
      try {
        const { token } = JSON.parse(e.data);
        accumulatedTextRef.current += token;
        setCurrentStreamedText((prev) => prev + token);
      } catch (err) {
        console.error('Error in token', err);
      }
    });

    eventSource.addEventListener('fallacy_alert', (e) => {
      try {
        const fallacy: FallacyAlert = JSON.parse(e.data);
        currentTurnFallaciesRef.current.push(fallacy);
        addFallacy(fallacy);
      } catch (err) {
        console.error('Error in fallacy_alert', err);
      }
    });

    eventSource.addEventListener('turn_end', (e) => {
      try {
        const data = JSON.parse(e.data);
        const speaker = currentSpeakerRef.current;
        const finalContent = accumulatedTextRef.current;

        if (speaker && finalContent.trim()) {
          // Always look up against fresh store personas to avoid stale closures
          const currentPersonas = useDebateStore.getState().personas;
          const matchingPersona = currentPersonas.find((p) => p.identifier === speaker.id);
          const newTurn: MessageTurn = {
            id: data.turn_id || `${speaker.id}_r${speaker.round}_${Date.now()}`,
            speaker_id: speaker.id,
            sender_name: speaker.name,
            role_title: matchingPersona ? matchingPersona.role_title : (speaker.id === 'moderator' ? 'Human Moderator' : 'Debater'),
            round_number: speaker.round,
            phase: speaker.phase,
            content: finalContent,
            citations: data.citations || [],
            fallacies: [...currentTurnFallaciesRef.current]
          };
          appendTurn(newTurn);
        }

        accumulatedTextRef.current = '';
        currentTurnFallaciesRef.current = [];
        setCurrentStreamedText('');
        setActiveSpeaker(null, null);
      } catch (err) {
        console.error('Error in turn_end', err);
      }
    });

    eventSource.addEventListener('verdict_ready', (e) => {
      try {
        const data = JSON.parse(e.data);
        setVerdict(data);
        setIsFinished(true);
        setStatusMessage('Debate concluded. Executive Decision Memo generated.');
        eventSource.close();
      } catch (err) {
        console.error('Error in verdict_ready', err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn('SSE EventSource state update:', err);
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  return {
    personas,
    turns,
    activeSpeakerId,
    activeSpeakerName,
    currentStreamedText,
    fallacies,
    verdict,
    isFinished,
    statusMessage,
    currentRound,
    totalRounds
  };
}
