'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage, LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { useAuth, UserRole } from '../context/AuthContext';
import { Sprout, Phone, Mail, ShieldCheck, Lock } from 'lucide-react';

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const { role, isAuthenticated } = useAuth();
  const [showAllLanguages, setShowAllLanguages] = React.useState(false);

  // Group languages: primary 6 first, remainder toggleable
  const primaryLanguages = LANGUAGES.slice(0, 6);
  const additionalLanguages = LANGUAGES.slice(6);

  const hasAccess = (requiredRole: UserRole) => {
    return isAuthenticated && role === requiredRole;
  };

  return (
    <footer className="relative z-20 bg-zinc-950 text-zinc-300 border-t border-zinc-800 text-xs selection:bg-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Overview (col-span-4) */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-white tracking-tight leading-tight">
                  {t.nav.brand}
                </span>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                  {t.nav.tagline}
                </span>
              </div>
            </Link>

            <p className="text-zinc-400 leading-relaxed text-xs max-w-sm">
              Direct agricultural trade connecting farmers, wholesale buyers, and consumers. Fair prices benchmarked to live market data with transparent settlement.
            </p>

            <div className="pt-1 flex flex-wrap gap-2 text-[11px] text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>AGMARK Quality Standards</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Direct Bank Settlement</span>
              </span>
            </div>
          </div>

          {/* Portals & Navigation (col-span-3) */}
          <div className="space-y-3 lg:col-span-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-zinc-800 pb-2">
              Platform Portals
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/#marketplace" className="hover:text-emerald-400 transition">
                  {t.nav.market}
                </Link>
              </li>
              <li>
                <Link
                  href={hasAccess('farmer') ? '/farmer' : '/login?role=farmer'}
                  className="hover:text-emerald-400 transition flex items-center justify-between"
                >
                  <span>{t.nav.farmer}</span>
                  {hasAccess('farmer') && (
                    <span className="text-[9px] font-mono uppercase px-1 rounded bg-emerald-500/20 text-emerald-300">Active</span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href={hasAccess('buyer') ? '/buyer' : '/login?role=buyer'}
                  className="hover:text-emerald-400 transition flex items-center justify-between"
                >
                  <span>{t.nav.buyer}</span>
                  {hasAccess('buyer') && (
                    <span className="text-[9px] font-mono uppercase px-1 rounded bg-blue-500/20 text-blue-300">Active</span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href={hasAccess('consumer') ? '/consumer' : '/login?role=consumer'}
                  className="hover:text-emerald-400 transition flex items-center justify-between"
                >
                  <span>{(t.nav as Record<string, string>)?.consumer || 'Consumer Hub'}</span>
                  {hasAccess('consumer') && (
                    <span className="text-[9px] font-mono uppercase px-1 rounded bg-amber-500/20 text-amber-300">Active</span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href={hasAccess('admin') ? '/logistics' : '/login?role=admin'}
                  className="hover:text-emerald-400 transition flex items-center justify-between"
                >
                  <span>{t.nav.logistics}</span>
                  {hasAccess('admin') && (
                    <span className="text-[9px] font-mono uppercase px-1 rounded bg-zinc-800 text-zinc-300">Active</span>
                  )}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-400 transition">
                  Pricing & Plans
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition">
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support (col-span-2) */}
          <div className="space-y-3 lg:col-span-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-zinc-800 pb-2">
              Support & Help
            </h4>
            <div className="space-y-2.5 text-xs text-zinc-400">
              <div>
                <span className="block text-zinc-500 text-[11px]">Toll-Free Helpline:</span>
                <a
                  href="tel:18008892603"
                  className="text-emerald-400 hover:underline font-mono text-xs inline-flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>1800-889-2603</span>
                </a>
              </div>
              <div>
                <span className="block text-zinc-500 text-[11px]">Grievance Desk:</span>
                <a
                  href="mailto:grievance@fasalmatrix.in"
                  className="text-zinc-300 hover:text-emerald-400 hover:underline text-xs inline-flex items-center gap-1.5 mt-0.5"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>grievance@fasalmatrix.in</span>
                </a>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal pt-1">
                Mon - Sat: 9:00 AM - 6:00 PM IST
              </p>
            </div>
          </div>

          {/* Regional Languages (col-span-3) */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">
                {t.common.regionalLangSupport}
              </h4>
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
                22 Languages
              </span>
            </div>

            {/* Primary Languages Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {primaryLanguages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code as LanguageCode)}
                  className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition border cursor-pointer font-medium ${
                    language === l.code
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>

            {/* Expand / Collapse More Regional Languages */}
            <div>
              <button
                type="button"
                onClick={() => setShowAllLanguages(!showAllLanguages)}
                className="w-full text-center py-1.5 text-[11px] font-mono font-bold text-emerald-400 hover:text-emerald-300 bg-zinc-900 hover:bg-zinc-850 rounded-lg border border-zinc-800 transition cursor-pointer"
              >
                {showAllLanguages ? '▲ Show Fewer Languages' : `▼ +16 More Official Languages (${additionalLanguages.length})`}
              </button>

              {showAllLanguages && (
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {additionalLanguages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLanguage(l.code as LanguageCode)}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition border cursor-pointer font-medium ${
                        language === l.code
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {l.native}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Corporate Details */}
        <div className="mt-10 pt-6 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-zinc-400">
          <div>
            <strong className="text-zinc-200 block font-semibold">Registered Entity:</strong>
            <span>Fasal Matrix Agrarian Technologies Pvt. Ltd.</span>
          </div>
          <div>
            <strong className="text-zinc-200 block font-semibold">Registered Office:</strong>
            <span>Muhana Mandi Complex, Sanganer, Jaipur, Rajasthan 302029</span>
          </div>
          <div>
            <strong className="text-zinc-200 block font-semibold">Nodal Grievance Officer:</strong>
            <span>Grievance Redressal Cell (Response SLA: Within 48 hours)</span>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} Fasal Matrix Agrarian Technologies. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium">
            <Link href="/privacy" className="hover:text-emerald-400 transition">
              {t.footer.privacy}
            </Link>
            <Link href="/terms" className="hover:text-emerald-400 transition">
              {t.footer.terms}
            </Link>
            <Link href="/refund-policy" className="hover:text-emerald-400 transition">
              Refund Policy
            </Link>
            <Link href="/cookie-policy" className="hover:text-emerald-400 transition">
              Cookie Policy
            </Link>
            <span className="text-[10px] text-zinc-500 font-mono">
              Age Restricted: 18+ Only
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
