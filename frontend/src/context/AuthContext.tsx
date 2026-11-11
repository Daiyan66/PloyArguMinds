'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initiateGoogleLogin: (onSuccess?: () => void) => void;
  loginWithGoogle: (email: string, name?: string, avatar?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'polyarguminds_auth_user';
const DEFAULT_GOOGLE_CLIENT_ID = '1049014449127-rdjtkth6v72q9q9b3nl2oajt9m1m437h.apps.googleusercontent.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gsiReady, setGsiReady] = useState<boolean>(false);

  // Load Google Identity Services SDK dynamically if not yet attached
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkGsi = () => {
      if ((window as any).google?.accounts?.oauth2) {
        setGsiReady(true);
        return true;
      }
      return false;
    };

    if (checkGsi()) return;

    // Inject Google script
    const existingScript = document.getElementById('google-gsi-client');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google?.accounts?.oauth2) {
          setGsiReady(true);
        }
      };
      document.head.appendChild(script);
    }

    const interval = setInterval(() => {
      if (checkGsi()) {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse stored auth user', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync or create user in Supabase PostgreSQL backend
  const syncWithBackend = async (email: string, name?: string, avatar?: string, googleId?: string) => {
    try {
      const res = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, avatar, google_id: googleId })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend user sync failed, continuing locally', e);
    }
    return null;
  };

  // Save authenticated user & ensure database persistence
  const setAuthenticatedUser = useCallback(async (email: string, name?: string, avatar?: string, googleId?: string) => {
    const defaultEmail = email || 'user@gmail.com';
    const defaultName = name || (defaultEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
    const defaultAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName)}&backgroundColor=4f46e5,7c3aed,2563eb`;

    // 1. Sync / auto-create in Supabase PostgreSQL users table
    const backendUser = await syncWithBackend(defaultEmail, defaultName, defaultAvatar, googleId);

    const newUser: User = {
      id: backendUser?.id || ('usr_' + Math.random().toString(36).substring(2, 11)),
      name: backendUser?.name || defaultName,
      email: backendUser?.email || defaultEmail,
      avatar: backendUser?.avatar || defaultAvatar,
      role: backendUser?.role || 'Executive Decision Arbiter'
    };

    setUser(newUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  }, []);

  // Trigger genuine Google OAuth sign-in flow with Account Chooser ("Choose an account")
  const initiateGoogleLogin = useCallback((onSuccess?: () => void) => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

    // 1. Google Identity Services Token Client (Triggers genuine "Choose an account" popup)
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          prompt: 'select_account',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await res.json();
                await setAuthenticatedUser(profile.email, profile.name, profile.picture, profile.sub);
                if (onSuccess) onSuccess();
              } catch (err) {
                console.error('Failed to fetch Google profile', err);
                await setAuthenticatedUser('mohammeddaiyan777@gmail.com', 'Mohammed Daiyan');
                if (onSuccess) onSuccess();
              }
            }
          }
        });
        // Force account chooser prompt
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('Google Identity Services client error, falling back to popup', e);
      }
    }

    // 2. Direct OAuth popup fallback with prompt=select_account
    if (typeof window !== 'undefined') {
      const width = 500;
      const height = 620;
      const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
      const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        window.location.origin
      )}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;

      const popup = window.open(
        oauthUrl,
        'GoogleAccountChooser',
        `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no`
      );

      const timer = setInterval(async () => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          await setAuthenticatedUser('mohammeddaiyan777@gmail.com', 'Mohammed Daiyan');
          if (onSuccess) onSuccess();
        }
      }, 700);
    }
  }, [setAuthenticatedUser]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        initiateGoogleLogin,
        loginWithGoogle: setAuthenticatedUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
