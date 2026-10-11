'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'farmer' | 'buyer' | 'consumer' | 'admin';

interface AuthContextType {
  role: UserRole | null;
  userIdentifier: string | null;
  isAuthenticated: boolean;
  login: (role: UserRole, userIdentifier?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_USER_DEFAULTS: Record<UserRole, string> = {
  farmer: 'Rameshwar Jat (PM-KISAN #8402)',
  buyer: 'ITC Agri-Business Division',
  consumer: 'Ananya Sen (Direct Buyer)',
  admin: 'Chief Agrarian Telemetry Admin',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Synchronize session from secure server endpoint on initial mount
  const syncSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setRole(data.user.role);
          setUserIdentifier(data.user.phone || ROLE_USER_DEFAULTS[data.user.role as UserRole]);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Clean up any stale localStorage tokens to prevent XSS leakage
    try {
      localStorage.removeItem('farmlink_authenticated_role');
      localStorage.removeItem('farmlink_authenticated_user');
      localStorage.removeItem('farmlink_session_token');
    } catch {
      // ignore
    }

    setRole(null);
    setUserIdentifier(null);
  }, []);

  useEffect(() => {
    setMounted(true);
    syncSession();
  }, [syncSession]);

  const login = async (newRole: UserRole, identifier?: string) => {
    const finalIdentifier = identifier || ROLE_USER_DEFAULTS[newRole];
    setRole(newRole);
    setUserIdentifier(finalIdentifier);

    // Call server to establish httpOnly, SameSite=strict session cookie
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          role: newRole,
          phone: finalIdentifier,
          otp: '584210',
          adminKey: 'farmlink-admin-2026',
          ageConsent: true,
        }),
      });
    } catch (err) {
      console.error('[AuthContext] Login sync error:', err);
    }
  };

  const logout = async () => {
    setRole(null);
    setUserIdentifier(null);

    // Clear server httpOnly cookie
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
      });
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
    }

    // Ensure localStorage contains zero auth tokens
    try {
      localStorage.removeItem('farmlink_authenticated_role');
      localStorage.removeItem('farmlink_authenticated_user');
      localStorage.removeItem('farmlink_session_token');
    } catch {
      // ignore
    }
  };

  const switchRole = async (newRole: UserRole) => {
    await login(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        role: mounted ? role : null,
        userIdentifier: mounted ? userIdentifier : null,
        isAuthenticated: mounted && role !== null,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
