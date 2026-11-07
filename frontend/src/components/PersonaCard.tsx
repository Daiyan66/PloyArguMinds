import React from 'react';
import { Persona } from '../lib/types';
import { Shield, Target, UserCheck } from 'lucide-react';

interface PersonaCardProps {
  persona: Persona;
  isActive: boolean;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona, isActive }) => {
  const isAgentA = persona.identifier === 'agent_a';

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
        isActive
          ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
          : 'bg-slate-950/60 border-slate-800 opacity-80 hover:opacity-100'
      }`}
    >
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
      )}

      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
          style={{ backgroundColor: persona.avatar_color }}
        >
          {persona.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-white">{persona.name}</h3>
            {isActive && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">{persona.role_title}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 my-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
            persona.bias_direction === 'FOR'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : 'bg-rose-950 text-rose-400 border border-rose-800'
          }`}
        >
          Stance: {persona.bias_direction}
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-snug line-clamp-3">
        {persona.core_worldview}
      </p>
    </div>
  );
};
