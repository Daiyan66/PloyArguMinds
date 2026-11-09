'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Key, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
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

export const GoogleAuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const { googleClientId, setGoogleClientId, handleGoogleCredential } = useAuth();
  const [clientIdInput, setClientIdInput] = useState(googleClientId || '');
  const [isEditingClientId, setIsEditingClientId] = useState(!googleClientId);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Initialize official Google Identity Services button
  useEffect(() => {
    if (!isOpen) return;

    if (!googleClientId) {
      setIsEditingClientId(true);
      return;
    }

    const checkAndInitGoogle = () => {
      const g = (window as any).google;
      if (g?.accounts?.id && googleBtnContainerRef.current) {
        try {
          g.accounts.id.initialize({
            client_id: googleClientId,
            callback: (res: { credential?: string }) => {
              if (res?.credential) {
                handleGoogleCredential(res.credential);
                onClose();
                if (onSuccess) onSuccess();
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });

          // Render real Google Sign-In button
          googleBtnContainerRef.current.innerHTML = '';
          g.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 320
          });

          // Optional: Prompt One-Tap
          g.accounts.id.prompt();
          setErrorMsg(null);
        } catch (err: any) {
          console.error('Failed to initialize Google Identity Services:', err);
          setErrorMsg(err.message || 'Failed to initialize Google Sign-In');
        }
      }
    };

    // Retry checking if script is ready
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        checkAndInitGoogle();
        clearInterval(interval);
      }
    }, 200);

    const timeout = setTimeout(() => clearInterval(interval), 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isOpen, googleClientId, handleGoogleCredential, onClose, onSuccess]);

  if (!isOpen) return null;

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) return;
    setGoogleClientId(clientIdInput.trim());
    setIsEditingClientId(false);
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
          <div className="inline-flex p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-3 shadow-sm">
            <GoogleLogoIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Real Google Authorization
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in securely via <strong className="font-semibold text-slate-700 dark:text-slate-200">Google Identity Services</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Real Google Button Container or Client ID Config */}
        {!isEditingClientId && googleClientId ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div ref={googleBtnContainerRef} className="flex justify-center w-full min-h-[44px]" />
              <p className="text-[11px] text-slate-400 mt-3 text-center">
                Clicking above opens the genuine Google OAuth account dialog.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
              <span className="font-mono text-[10px] truncate max-w-[200px]" title={googleClientId}>
                Client: {googleClientId.slice(0, 15)}...
              </span>
              <button
                type="button"
                onClick={() => setIsEditingClientId(true)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
              >
                Change Client ID
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveClientId} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                <Key size={14} />
                <span>Google OAuth 2.0 Web Client ID Required</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/90">
                To run authentic Google sign-in without dummy credentials, supply your Google Cloud Client ID (or set <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in <code className="font-mono">.env</code>).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Google OAuth Client ID
              </label>
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="e.g. 123456789-xxxxxx.apps.googleusercontent.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Get a Client ID from Google Cloud Console</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              {googleClientId && (
                <button
                  type="button"
                  onClick={() => setIsEditingClientId(false)}
                  className="px-3.5 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={!clientIdInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm disabled:opacity-50"
              >
                Connect Real Google OAuth
              </button>
            </div>
          </form>
        )}

        {/* Security Footer Notice */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Cryptographic JWT Validation</span>
          </div>
          <span>Direct Google GIS</span>
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
