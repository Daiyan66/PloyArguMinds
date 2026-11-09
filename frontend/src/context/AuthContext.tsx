'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string; // Real Google User ID (sub)
  name: string; // Real Google Account Name
  email: string; // Real Google Account Email
  avatar: string; // Real Google Profile Picture
  emailVerified: boolean;
  provider: 'google';
  idToken?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  googleClientId: string;
  setGoogleClientId: (id: string) => void;
  handleGoogleCredential: (credential: string) => void;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'polyarguminds_google_user';
const LOCAL_STORAGE_CLIENT_ID_KEY = 'polyarguminds_google_client_id';

// Decode genuine cryptographic Google OAuth ID token (JWT)
export function decodeGoogleJwt(token: string): {
  sub: string;
  name: string;
  email: string;
  picture: string;
  email_verified: boolean;
} {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) throw new Error('Malformed JWT token');
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to decode Google JWT', err);
    throw new Error('Invalid Google credential token');
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [googleClientId, setGoogleClientIdState] = useState<string>('');

  // Initialize client ID and existing stored user session
  useEffect(() => {
    try {
      const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
      const storedClientId = localStorage.getItem(LOCAL_STORAGE_CLIENT_ID_KEY) || '';
      setGoogleClientIdState(envClientId || storedClientId || '');

      const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to restore auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setGoogleClientId = useCallback((id: string) => {
    const cleaned = id.trim();
    setGoogleClientIdState(cleaned);
    if (cleaned) {
      localStorage.setItem(LOCAL_STORAGE_CLIENT_ID_KEY, cleaned);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CLIENT_ID_KEY);
    }
  }, []);

  // Handle genuine Google Identity Services credential response
  const handleGoogleCredential = useCallback((credential: string) => {
    try {
      const payload = decodeGoogleJwt(credential);

      if (!payload.email) {
        throw new Error('Google credential does not contain an email');
      }

      const realGoogleUser: User = {
        id: payload.sub,
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        avatar: payload.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.name || payload.email)}`,
        emailVerified: Boolean(payload.email_verified),
        provider: 'google',
        idToken: credential
      };

      setUser(realGoogleUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(realGoogleUser));
      setShowAuthModal(false);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      alert('Google authentication failed: ' + (err.message || 'Invalid token'));
    }
  }, []);

  const logout = useCallback(() => {
    if (user && typeof window !== 'undefined' && (window as any).google?.accounts?.id?.revoke) {
      try {
        (window as any).google.accounts.id.revoke(user.email, () => {});
      } catch (e) {
        // Ignored
      }
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        googleClientId,
        setGoogleClientId,
        handleGoogleCredential,
        logout,
        showAuthModal,
        setShowAuthModal
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
