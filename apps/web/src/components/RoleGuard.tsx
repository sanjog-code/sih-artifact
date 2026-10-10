'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth, UserRole } from '../context/AuthContext';
import { ShieldAlert, Lock, ArrowRight, Home, UserCheck } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  portalName: string;
  children: React.ReactNode;
}

const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  farmer: 'Verified Farmer / Producer',
  buyer: 'Institutional Bulk Buyer',
  consumer: 'Direct Consumer',
  admin: 'Network Administrator',
};

export default function RoleGuard({ allowedRoles, portalName, children }: RoleGuardProps) {
  const { role, isAuthenticated, userIdentifier } = useAuth();

  // If authenticated and role is in the allowed list, render the portal children
  if (isAuthenticated && role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  const primaryAllowed = allowedRoles[0];
  const requiredRoleName = ROLE_DISPLAY_NAMES[primaryAllowed] || primaryAllowed;

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-zinc-50/50 dark:bg-zinc-950">
      <div className="max-w-lg w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Restricted Agrarian Access</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            {portalName} Access Locked
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
            This module is reserved exclusively for accredited <strong>{requiredRoleName}</strong> accounts under agrarian network protocol.
          </p>
        </div>

        {/* Current Identity Status */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 text-xs text-left">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold mb-1">
            Current Session Identity
          </div>
          <div className="flex items-center justify-between font-medium text-zinc-800 dark:text-zinc-200">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-zinc-500" />
              <span>
                {isAuthenticated && role
                  ? `Active: ${ROLE_DISPLAY_NAMES[role]} (${userIdentifier})`
                  : 'Unauthenticated Public Visitor'}
              </span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold">
              {role ? role.toUpperCase() : 'GUEST'}
            </span>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/login?role=${primaryAllowed}`}
            className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
          >
            <span>Sign In as {requiredRoleName.split('/')[0].trim()}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="py-3 px-4 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
