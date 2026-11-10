'use client';

import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
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
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailOrPhone.trim();
    if (!cleanEmail) {
      setError('Enter an email or phone number');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Normalize email format
    const formattedEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail.replace(/\s+/g, '')}@gmail.com`;
    const derivedName = formattedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    setTimeout(() => {
      loginWithGoogle(formattedEmail, derivedName);
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 450);
  };

  const handleQuickDemo = (demoEmail: string, demoName: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      loginWithGoogle(demoEmail, demoName);
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl text-slate-800">
        
        {/* Main Google Accounts Styled Card */}
        <div className="bg-white rounded-3xl sm:rounded-[28px] border border-slate-200 shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          
          {/* Close Modal Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
            title="Close"
          >
            <X size={20} />
          </button>

          {/* Top Bar: Google G Logo + 'Sign in with Google' */}
          <div className="flex items-center gap-2.5 mb-8">
            <GoogleLogoIcon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-normal text-slate-600 tracking-normal">
              Sign in with Google
            </span>
          </div>

          {/* 2-Column Grid Matching the Official Google Sign-In Screen */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: App Brand Mark & Headings */}
            <div className="md:col-span-5 space-y-4">
              {/* Brand Leaf / Shield Icon */}
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
              </div>

              <div>
                <h2 className="text-3xl sm:text-[34px] font-normal text-slate-900 tracking-tight leading-tight">
                  Sign in
                </h2>
                <p className="text-sm text-slate-700 mt-2">
                  to continue to{' '}
                  <span className="text-[#0b57d0] font-medium hover:underline cursor-pointer">
                    PolyArguMinds, Inc.
                  </span>
                </p>
              </div>

              {/* Quick Select Shortcut for convenience */}
              <div className="pt-2 hidden md:block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Fast Demo Select:
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('marcus.vance@arguminds.internal', 'Marcus Vance')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#0b57d0] hover:bg-blue-50/50 text-xs text-slate-700 truncate transition"
                  >
                    marcus.vance@arguminds.internal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('elena.rostova@gmail.com', 'Elena Rostova')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#0b57d0] hover:bg-blue-50/50 text-xs text-slate-700 truncate transition"
                  >
                    elena.rostova@gmail.com
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Google Input Field & Action Buttons */}
            <div className="md:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Outlined Floating Input */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      id="googleEmailInput"
                      value={emailOrPhone}
                      onChange={(e) => {
                        setEmailOrPhone(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Email or phone"
                      autoFocus
                      className={`w-full px-4 py-3.5 rounded-md border ${
                        error ? 'border-red-600 focus:border-red-600' : 'border-slate-400 focus:border-[#0b57d0]'
                      } text-sm text-slate-900 placeholder:text-slate-500 bg-white focus:outline-none focus:ring-1 ${
                        error ? 'focus:ring-red-600' : 'focus:ring-[#0b57d0]'
                      } transition`}
                    />
                  </div>

                  {error ? (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 font-medium">
                      <span>⚠</span> {error}
                    </p>
                  ) : null}

                  <div className="mt-2 text-left">
                    <button
                      type="button"
                      onClick={() => setEmailOrPhone('decision.architect@gmail.com')}
                      className="text-xs font-semibold text-[#0b57d0] hover:underline"
                    >
                      Forgot email?
                    </button>
                  </div>
                </div>

                {/* Privacy and Terms Notice */}
                <p className="text-xs text-slate-600 leading-relaxed text-left">
                  Before using this app, you can review PolyArguMinds, Inc.&apos;s{' '}
                  <span className="text-[#0b57d0] hover:underline cursor-pointer">
                    Privacy Policy
                  </span>{' '}
                  and{' '}
                  <span className="text-[#0b57d0] hover:underline cursor-pointer">
                    Terms of Service
                  </span>
                  .
                </p>

                {/* Bottom Row Actions */}
                <div className="flex items-center justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setEmailOrPhone('new.executive@gmail.com')}
                    className="text-xs sm:text-sm font-semibold text-[#0b57d0] hover:underline px-1 py-1"
                  >
                    Create account
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium text-xs sm:text-sm transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Checking...' : 'Next'}
                  </button>
                </div>

              </form>
            </div>

          </div>

        </div>

        {/* Outer Footer: Language + Google Help / Privacy / Terms Links */}
        <div className="flex items-center justify-between px-3 pt-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 hover:text-slate-700 cursor-pointer">
            <span>English (United States)</span>
            <ChevronDown size={12} />
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-slate-700 cursor-pointer">Help</span>
            <span className="hover:text-slate-700 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-700 cursor-pointer">Terms</span>
          </div>
        </div>

      </div>
    </div>
  );
};
