'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-lg border transition-colors ${
        theme === 'dark'
          ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
      } ${className}`}
      title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};
