'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Sprout,
  Building2,
  ShoppingCart,
  Menu,
  CreditCard,
  Sliders,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMobileMenu?: () => void;
}

export default function MobileBottomNav({ onOpenMobileMenu }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { role, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const isHome = pathname === '/';
  const isFarmer = pathname === '/farmer';
  const isBuyer = pathname === '/buyer';
  const isConsumer = pathname === '/consumer';
  const isPricing = pathname === '/pricing';
  const isAdmin = pathname === '/admin' || pathname === '/logistics';

  // Localized labels with fallbacks
  const labelHome = t?.nav?.home || 'Home';
  const labelFarmer = (t?.nav as Record<string, string>)?.farmerShort || 'Farmer';
  const labelBuyer = (t?.nav as Record<string, string>)?.buyerShort || 'Bulk';
  const labelConsumer = (t?.nav as Record<string, string>)?.consumerShort || 'Shop';
  const labelMenu = (t?.common as Record<string, string>)?.menu || 'Menu';

  return (
    <aside
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200/90 dark:border-zinc-800 transition-colors shadow-lg"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1 items-stretch">
        {/* 1. HOME / OVERVIEW */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition rounded-xl ${
            isHome
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
          aria-label={labelHome}
        >
          <div className={`p-1 rounded-lg ${isHome ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight truncate max-w-[56px] text-center">{labelHome}</span>
        </Link>

        {/* 2. FARMER PORTAL */}
        <Link
          href="/farmer"
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition rounded-xl ${
            isFarmer
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
          aria-label={labelFarmer}
        >
          <div className={`p-1 rounded-lg ${isFarmer ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''}`}>
            <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[10px] leading-tight truncate max-w-[56px] text-center">{labelFarmer}</span>
        </Link>

        {/* 3. CONSUMER PORTAL */}
        <Link
          href="/consumer"
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition rounded-xl ${
            isConsumer
              ? 'text-amber-700 dark:text-amber-400 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
          aria-label={labelConsumer}
        >
          <div className={`p-1 rounded-lg ${isConsumer ? 'bg-amber-50 dark:bg-amber-950/60' : ''}`}>
            <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-[10px] leading-tight truncate max-w-[56px] text-center">{labelConsumer}</span>
        </Link>

        {/* 4. BUYER OR ADMIN/PRICING */}
        {role === 'admin' ? (
          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition rounded-xl ${
              isAdmin
                ? 'text-purple-700 dark:text-purple-400 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
            aria-label="Admin"
          >
            <div className={`p-1 rounded-lg ${isAdmin ? 'bg-purple-50 dark:bg-purple-950/60' : ''}`}>
              <Sliders className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-[10px] leading-tight truncate max-w-[56px] text-center">Admin</span>
          </Link>
        ) : (
          <Link
            href="/buyer"
            className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition rounded-xl ${
              isBuyer
                ? 'text-blue-700 dark:text-blue-400 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
            aria-label={labelBuyer}
          >
            <div className={`p-1 rounded-lg ${isBuyer ? 'bg-blue-50 dark:bg-blue-950/60' : ''}`}>
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[10px] leading-tight truncate max-w-[56px] text-center">{labelBuyer}</span>
          </Link>
        )}

        {/* 5. MENU / MORE DRAWER */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          aria-label="Open Navigation Menu"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight truncate max-w-[56px] text-center">{labelMenu}</span>
        </button>
      </div>
    </aside>
  );
}
