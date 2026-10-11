'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'farmer' | 'buyer' | 'consumer' | 'admin';

interface AuthContextType {
  role: UserRole | null;
  userIdentifier: string | null;
  isAuthenticated: boolean;
  login: (role: UserRole, userIdentifier?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
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

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      try {
        const storedRole = localStorage.getItem('farmlink_authenticated_role') as UserRole | null;
        const storedUser = localStorage.getItem('farmlink_authenticated_user');
        if (storedRole && ['farmer', 'buyer', 'consumer', 'admin'].includes(storedRole)) {
          setRole(storedRole);
          setUserIdentifier(storedUser || ROLE_USER_DEFAULTS[storedRole]);
        }
      } catch {
        // localStorage may fail in restricted browser contexts
      }
    });
  }, []);

  const login = (newRole: UserRole, identifier?: string) => {
    const finalIdentifier = identifier || ROLE_USER_DEFAULTS[newRole];
    setRole(newRole);
    setUserIdentifier(finalIdentifier);
    try {
      localStorage.setItem('farmlink_authenticated_role', newRole);
      localStorage.setItem('farmlink_authenticated_user', finalIdentifier);
      document.cookie = `farmlink_role=${newRole}; path=/; max-age=2592000; SameSite=Lax`;
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setRole(null);
    setUserIdentifier(null);
    try {
      localStorage.removeItem('farmlink_authenticated_role');
      localStorage.removeItem('farmlink_authenticated_user');
      document.cookie = 'farmlink_role=; path=/; max-age=0; SameSite=Lax';
    } catch {
      // ignore
    }
  };

  const switchRole = (newRole: UserRole) => {
    login(newRole);
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
