'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage, LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { useAuth, UserRole } from '../context/AuthContext';
import { ShieldCheck, CheckCircle2, Lock, Scale, Sprout, ArrowRight } from 'lucide-react';

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const { role, isAuthenticated } = useAuth();
  const [showAllLanguages, setShowAllLanguages] = React.useState(false);

  // Group languages: top primary 6 first, remainder toggleable
  const primaryLanguages = LANGUAGES.slice(0, 6);
  const additionalLanguages = LANGUAGES.slice(6);

  // Helper for role access check
  const hasAccess = (requiredRole: UserRole) => {
    return isAuthenticated && role === requiredRole;
  };

  return (
    <footer className="relative z-20 bg-zinc-950 text-zinc-300 border-t border-zinc-800 text-xs selection:bg-emerald-500/20 shadow-2xl">
      {/* Top Banner: Institutional Standards & Accreditations */}
      <div className="border-b border-zinc-850 bg-zinc-900/90 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-zinc-100 font-bold text-xs">
            <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span>{t.about.certificationsTitle}:</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-zinc-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {t.about.cert1}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {t.about.cert2}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {t.about.cert3}
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {t.about.cert4}
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Info (col-span-4) */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 group hover:opacity-90 transition">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-bold shadow-md group-hover:scale-105 transition-transform">
                <Sprout className="w-4 h-4 text-zinc-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">
                  {t.nav.brand}
                </span>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                  {t.nav.tagline}
                </span>
              </div>
            </Link>

            <p className="text-zinc-400 leading-relaxed text-xs max-w-sm">
              {t.footer.description}
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-zinc-900 text-emerald-400 border border-emerald-500/30 font-semibold">
                <Scale className="w-3 h-3 text-emerald-400" />
                {t.common.zeroSpeculation}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 font-semibold">
                <Lock className="w-3 h-3 text-purple-400" />
                RBI Nodal Escrow T+1
              </span>
            </div>
          </div>

          {/* Quick Navigation (col-span-2) */}
          <div className="space-y-3.5 lg:col-span-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-zinc-800 pb-2 flex items-center justify-between">
              <span>{t.footer.quickLinks}</span>
              {isAuthenticated && role && (
                <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                  {role}
                </span>
              )}
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              {/* Universal: Home / Overview */}
              <li>
                <Link href="/" className="hover:text-emerald-400 transition flex items-center gap-1">
                  {t.nav.home}
                </Link>
              </li>

              {/* Universal: Marketplace */}
              <li>
                <Link href="/#marketplace" className="hover:text-emerald-400 transition flex items-center gap-1">
                  {t.nav.market}
                </Link>
              </li>

              {/* Role Restricted: Farmer Hub */}
              <li>
                {hasAccess('farmer') ? (
                  <Link href="/farmer" className="hover:text-emerald-400 text-emerald-300 font-semibold transition flex items-center justify-between group">
                    <span>{t.nav.farmer}</span>
                    <span className="text-[9px] font-mono uppercase px-1 rounded bg-emerald-500/20 text-emerald-300">Active</span>
                  </Link>
                ) : (
                  <Link
                    href="/login?role=farmer"
                    className="hover:text-white transition flex items-center justify-between text-zinc-500 group"
                    title="Farmer credentials required. Click to sign in."
                  >
                    <span className="group-hover:text-zinc-300 transition">{t.nav.farmer}</span>
                    <span className="text-[10px] flex items-center gap-1 text-zinc-500 group-hover:text-amber-400 transition font-mono">
                      <Lock className="w-3 h-3" />
                      <span>Login</span>
                    </span>
                  </Link>
                )}
              </li>

              {/* Role Restricted: Buyer Desk */}
              <li>
                {hasAccess('buyer') ? (
                  <Link href="/buyer" className="hover:text-blue-400 text-blue-300 font-semibold transition flex items-center justify-between group">
                    <span>{t.nav.buyer}</span>
                    <span className="text-[9px] font-mono uppercase px-1 rounded bg-blue-500/20 text-blue-300">Active</span>
                  </Link>
                ) : (
                  <Link
                    href="/login?role=buyer"
                    className="hover:text-white transition flex items-center justify-between text-zinc-500 group"
                    title="Bulk Buyer credentials required. Click to sign in."
                  >
                    <span className="group-hover:text-zinc-300 transition">{t.nav.buyer}</span>
                    <span className="text-[10px] flex items-center gap-1 text-zinc-500 group-hover:text-amber-400 transition font-mono">
                      <Lock className="w-3 h-3" />
                      <span>Login</span>
                    </span>
                  </Link>
                )}
              </li>

              {/* Role Restricted: Direct Consumer */}
              <li>
                {hasAccess('consumer') ? (
                  <Link href="/consumer" className="hover:text-amber-400 text-amber-300 font-semibold transition flex items-center justify-between group">
                    <span>{(t.nav as Record<string, string>)?.consumer || 'Consumer Hub'}</span>
                    <span className="text-[9px] font-mono uppercase px-1 rounded bg-amber-500/20 text-amber-300">Active</span>
                  </Link>
                ) : (
                  <Link
                    href="/login?role=consumer"
                    className="hover:text-white transition flex items-center justify-between text-zinc-500 group"
                    title="Consumer credentials required. Click to sign in."
                  >
                    <span className="group-hover:text-zinc-300 transition">{(t.nav as Record<string, string>)?.consumer || 'Consumer Hub'}</span>
                    <span className="text-[10px] flex items-center gap-1 text-zinc-500 group-hover:text-amber-400 transition font-mono">
                      <Lock className="w-3 h-3" />
                      <span>Login</span>
                    </span>
                  </Link>
                )}
              </li>

              {/* Role Restricted: Logistics & Fleet / Admin */}
              <li>
                {hasAccess('admin') ? (
                  <Link href="/logistics" className="hover:text-purple-400 text-purple-300 font-semibold transition flex items-center justify-between group">
                    <span>{t.nav.logistics}</span>
                    <span className="text-[9px] font-mono uppercase px-1 rounded bg-purple-500/20 text-purple-300">Active</span>
                  </Link>
                ) : (
                  <Link
                    href="/login?role=admin"
                    className="hover:text-white transition flex items-center justify-between text-zinc-500 group"
                    title="Administrator / Logistics credentials required. Click to sign in."
                  >
                    <span className="group-hover:text-zinc-300 transition">{t.nav.logistics}</span>
                    <span className="text-[10px] flex items-center gap-1 text-zinc-500 group-hover:text-amber-400 transition font-mono">
                      <Lock className="w-3 h-3" />
                      <span>Login</span>
                    </span>
                  </Link>
                )}
              </li>

              {/* Universal: Warehousing & Architecture */}
              <li>
                <Link href="/#architecture" className="hover:text-emerald-400 transition flex items-center gap-1">
                  {t.nav.warehouse}
                </Link>
              </li>

              {/* Universal: About Us & Cause */}
              <li>
                <Link href="/about" className="hover:text-white text-emerald-400 font-bold transition flex items-center gap-1">
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Pillars of Trust (col-span-3) */}
          <div className="space-y-3.5 lg:col-span-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-zinc-800 pb-2">
              {t.footer.trustPillars}
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/about#standards-quality" className="hover:text-emerald-400 transition leading-snug block">
                  {t.about.pillar1Title}
                </Link>
              </li>
              <li>
                <Link href="/about#standards-wdra" className="hover:text-emerald-400 transition leading-snug block">
                  {t.about.pillar2Title}
                </Link>
              </li>
              <li>
                <Link href="/about#standards-msp" className="hover:text-emerald-400 transition leading-snug block">
                  {t.about.pillar3Title}
                </Link>
              </li>
              <li>
                <Link href="/about#standards-escrow" className="hover:text-emerald-400 transition leading-snug block">
                  {t.about.pillar4Title}
                </Link>
              </li>
              <li>
                <Link href="/about#standards-telemetry" className="hover:text-emerald-400 transition leading-snug block">
                  {t.about.pillar5Title}
                </Link>
              </li>
            </ul>
          </div>

          {/* Regional Languages (col-span-3) */}
          <div className="space-y-3.5 sm:col-span-2 lg:col-span-3">
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
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold shadow-xs'
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
                className="w-full text-center py-1.5 text-[11px] font-mono font-bold text-emerald-400 hover:text-emerald-300 bg-zinc-900 hover:bg-zinc-850 rounded-lg border border-zinc-800 transition"
              >
                {showAllLanguages ? '▲ Show Fewer Languages' : `▼ +16 More Official Languages (${additionalLanguages.length})`}
              </button>

              {showAllLanguages && (
                <div className="grid grid-cols-2 gap-1.5 mt-2 animate-in fade-in duration-200">
                  {additionalLanguages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLanguage(l.code as LanguageCode)}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition border cursor-pointer font-medium ${
                        language === l.code
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold shadow-xs'
                          : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {l.native}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[10px] text-zinc-400 leading-normal pt-1">
              {t.footer.legalNotice}
            </p>
          </div>
        </div>

        {/* Corporate Registration & Statutory Grievance Details */}
        <div className="mt-10 pt-6 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-zinc-300">
          <div>
            <strong className="text-white block font-semibold">Registered Entity & CIN:</strong>
            <span className="text-zinc-400">Fasal Matrix Agrarian Technologies Pvt. Ltd.</span>
            <span className="block text-zinc-400 font-mono">CIN: U01111RJ2026PTC089201</span>
          </div>
          <div>
            <strong className="text-white block font-semibold">Registered Office & Terminal Hub:</strong>
            <span className="text-zinc-400">Terminal 3, Muhana Mandi Complex, Sanganer, Jaipur, Rajasthan 302029</span>
          </div>
          <div>
            <strong className="text-white block font-semibold">Nodal Grievance Officer:</strong>
            <span className="text-zinc-400">Rajesh V. Meena (</span>
            <a href="mailto:grievance@fasalmatrix.in" className="text-emerald-400 hover:underline">
              grievance@fasalmatrix.in
            </a>
            <span className="text-zinc-400">)</span>
            <span className="block text-zinc-400">Response SLA: Within 48 hours</span>
            <div className="mt-1">
              <a href="tel:18008892603" className="text-emerald-400 hover:underline font-mono text-[10px]">
                📞 Toll-Free Helpline: 1800-889-2603
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} {t.footer.copyright}. All rights reserved.</p>
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
            <span className="text-[10px] text-zinc-400 font-mono">
              Age Restricted: 18+ Only
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
