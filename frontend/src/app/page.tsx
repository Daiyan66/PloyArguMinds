'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LandingPage } from '../components/LandingPage';
import DashboardPage from './dashboard/page';

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  // If loading auth state from localStorage, provide a clean subtle placeholder
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Initializing PolyArguMinds...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, always show the landing page combined with Google login
  if (!isAuthenticated) {
    return <LandingPage onLaunchDashboard={() => setView('dashboard')} />;
  }

  // If authenticated and user chose landing view, allow viewing landing with easy toggle
  if (view === 'landing') {
    return <LandingPage onLaunchDashboard={() => setView('dashboard')} />;
  }

  // Default authenticated view: Dashboard with Platform Guide in navbar
  return <DashboardPage />;
}
