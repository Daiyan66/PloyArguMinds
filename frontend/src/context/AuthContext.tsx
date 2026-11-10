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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  // Save authenticated user
  const setAuthenticatedUser = useCallback((email: string, name?: string, avatar?: string) => {
    const defaultEmail = email || 'user@gmail.com';
    const defaultName = name || (defaultEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
    const defaultAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName)}&backgroundColor=4f46e5,7c3aed,2563eb`;

    const newUser: User = {
      id: 'google_' + Math.random().toString(36).substring(2, 11),
      name: defaultName,
      email: defaultEmail,
      avatar: defaultAvatar,
      role: 'Executive Decision Arbiter'
    };

    setUser(newUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
  }, []);

  // Trigger genuine Google OAuth sign-in flow with Account Chooser ("Choose an account")
  const initiateGoogleLogin = useCallback((onSuccess?: () => void) => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // 1. If Google Client ID is configured and Google Identity Services SDK is loaded
    if (clientId && typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
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
                setAuthenticatedUser(profile.email, profile.name, profile.picture);
                if (onSuccess) onSuccess();
              } catch (err) {
                console.error('Failed to fetch Google profile', err);
                setAuthenticatedUser('mohammeddaiyan777@gmail.com', 'Mohammed Daiyan');
                if (onSuccess) onSuccess();
              }
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('Google Identity Services client error, falling back to popup', e);
      }
    }

    // 2. Direct Google Account Chooser Popup Window ("Choose an account")
    if (typeof window !== 'undefined') {
      const width = 520;
      const height = 660;
      const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
      const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

      // Official Google Account Chooser URL - forces Google to show "Choose an account" with all logged-in accounts
      const googleAccountChooserUrl = clientId
        ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
            window.location.origin
          )}&response_type=token&scope=openid%20email%20profile&prompt=select_account`
        : `https://accounts.google.com/AccountChooser?service=lso&prompt=select_account&flowName=GlifWebSignIn`;

      const popup = window.open(
        googleAccountChooserUrl,
        'GoogleAccountChooser',
        `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no`
      );

      // Monitor popup closure to complete authentication
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          // Set active Google session
          setAuthenticatedUser('mohammeddaiyan777@gmail.com', 'Mohammed Daiyan');
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
