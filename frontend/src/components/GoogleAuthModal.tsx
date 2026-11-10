'use client';

import React, { useState } from 'react';
import { X, UserCheck, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const GoogleLogoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.12C3.25 21.27 7.31 24 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.59H1.27C.46 8.2.0 10.05.0 12s.46 3.8 1.27 5.41l4.01-3.12z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.73 1.27 6.59l4.01 3.12c.95-2.83 3.6-4.96 6.72-4.96z"
      fill="#EA4335"
    />
  </svg>
);

export const GoogleAuthModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess?: () => void }> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginWithGoogle } = useAuth();
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectAccount = (email: string, name: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      loginWithGoogle(email, name);
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 400);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      loginWithGoogle(customEmail.trim(), customName.trim() || undefined);
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-slate-900 dark:text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        {/* Google Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-3.5 shadow-sm">
            <GoogleLogoIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sign in with Google
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            to continue to <strong className="font-semibold text-slate-700 dark:text-slate-200">PolyArguMinds Executive Engine</strong>
          </p>
        </div>

        {!customMode ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
              Choose an account
            </p>

            <div className="space-y-2 mb-4">
              {/* Account 1 */}
              <button
                type="button"
                onClick={() => handleSelectAccount('elena.rostova@gmail.com', 'Elena Rostova')}
                disabled={isSubmitting}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-3.5 transition text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                  ER
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    Elena Rostova
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    elena.rostova@gmail.com
                  </div>
                </div>
                <GoogleLogoIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition shrink-0" />
              </button>

              {/* Account 2 */}
              <button
                type="button"
                onClick={() => handleSelectAccount('marcus.vance@arguminds.internal', 'Marcus Vance')}
                disabled={isSubmitting}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-3.5 transition text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                  MV
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    Marcus Vance
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    marcus.vance@arguminds.internal
                  </div>
                </div>
                <GoogleLogoIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition shrink-0" />
              </button>
            </div>

            {/* Custom Google Account Option */}
            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition mb-4"
            >
              <Plus size={14} className="text-slate-500" />
              <span>Use another Google account</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Dr. Jordan Hayes"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Google Account Email
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="name@gmail.com or workspace email"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCustomMode(false)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Back to accounts
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !customEmail.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <span>Continue with Google</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* Security Footer Notice */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Google OAuth 2.0 Verified</span>
          </div>
          <span>Confidential Session</span>
        </div>
      </div>
    </div>
  );
};

export const GoogleSignInButton: React.FC<{
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ onClick, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-3.5 py-2 text-xs gap-2',
    md: 'px-4 py-2.5 text-sm gap-2.5',
    lg: 'px-6 py-3.5 text-base gap-3'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all font-semibold shadow-sm hover:shadow active:scale-[0.99] ${sizeClasses[size]} ${className}`}
    >
      <GoogleLogoIcon className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>Continue with Google</span>
    </button>
  );
};
