export interface Persona {
  id: string;
  identifier: string; // 'agent_a' | 'agent_b' | 'judge'
  name: string;
  role_title: string;
  bias_direction: 'FOR' | 'AGAINST' | 'NEUTRAL';
  core_worldview: string;
  system_prompt?: string;
  avatar_color: string;
}

export interface Citation {
  source_title: string;
  page_number?: number;
  url?: string;
  snippet: string;
}

export interface FallacyAlert {
  fallacy_type: string;
  quote: string;
  explanation: string;
}

export interface MessageTurn {
  id: string;
  speaker_id: string;
  sender_name: string;
  role_title: string;
  round_number: number;
  phase: string; // 'FOUNDATION' | 'EVIDENCE' | 'CLASH' | 'INTERJECTION'
  content: string;
  citations: Citation[];
  fallacies: FallacyAlert[];
}

export interface ScorecardDetail {
  logical_rigor: number;
  evidence_grounding: number;
  rebuttal_directness: number;
  total: number;
}

export interface Verdict {
  winner_identifier?: string;
  scorecard: {
    agent_a: ScorecardDetail;
    agent_b: ScorecardDetail;
  };
  key_concessions: string[];
  unresolved_risks: string[];
  executive_recommendation: string;
  action_plan: string[];
}

export interface SessionData {
  id: string;
  topic: string;
  mode: string;
  status: string;
  total_rounds: number;
  current_round: number;
  file_name?: string;
  personas: Persona[];
  turns: MessageTurn[];
  verdict?: Verdict | null;
}
