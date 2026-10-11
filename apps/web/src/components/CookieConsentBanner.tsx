'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if consent has already been recorded
    const consent = document.cookie
      .split('; ')
      .find((row) => row.startsWith('farmlink_cookies_consent='));

    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const setConsent = (choice: 'accepted' | 'necessary_only') => {
    document.cookie = `farmlink_cookies_consent=${choice}; path=/; max-age=31536000; SameSite=Lax`;
    setShowBanner(false);
  };

  if (!mounted || !showBanner) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      role="region"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-950 dark:text-zinc-50 font-bold text-xs sm:text-sm">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <span>Privacy & Functional Cookies</span>
          </div>
          <button
            type="button"
            onClick={() => setConsent('necessary_only')}
            aria-label="Dismiss cookie notice with necessary only"
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition p-1 rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          We use strictly necessary functional cookies for regional language selection and secure portal logins. We never use third-party advertising tracking. Read our{' '}
          <Link href="/cookie-policy" className="underline font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800">
            Cookie Policy
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800">
            Privacy Protocol
          </Link>.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setConsent('accepted')}
            className="flex-1 py-2 px-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>
          <button
            type="button"
            onClick={() => setConsent('necessary_only')}
            className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition flex items-center justify-center shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span>Necessary Only</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
