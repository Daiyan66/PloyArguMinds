import { SessionData } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function createSession(
  topic: string,
  mode: string = 'DEBATE',
  totalRounds: number = 5,
  userId?: string
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, mode, total_rounds: totalRounds, user_id: userId })
  });
  if (!res.ok) {
    throw new Error(`Failed to create session: ${res.statusText}`);
  }
  return res.json();
}

export async function uploadDocument(sessionId: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/files/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    throw new Error(`Failed to upload file: ${res.statusText}`);
  }
  return res.json();
}

export async function getSession(sessionId: string): Promise<SessionData> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch session: ${res.statusText}`);
  }
  return res.json();
}

export async function interjectConstraint(sessionId: string, content: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/interject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  if (!res.ok) {
    throw new Error(`Failed to inject constraint: ${res.statusText}`);
  }
  return res.json();
}

export async function togglePause(sessionId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/pause`, {
    method: 'POST'
  });
  return res.json();
}

export async function extendRounds(sessionId: string, additional: number = 1): Promise<any> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/extend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ additional_rounds: additional })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Failed to extend session: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error(`Failed to delete session: ${res.statusText}`);
  }
  return res.json();
}
