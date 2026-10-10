'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage, LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { ShieldCheck, CheckCircle2, Lock, Scale, Sprout } from 'lucide-react';

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 text-xs">
      {/* Top Banner: Institutional Standards */}
      <div className="border-b border-zinc-900 bg-zinc-900/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t.about.certificationsTitle}:</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {t.about.cert1}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {t.about.cert2}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {t.about.cert3}
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              {t.about.cert4}
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold">
                <Sprout className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">{t.nav.brand}</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {t.footer.description}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                <Scale className="w-3 h-3 text-emerald-400" />
                {t.common.zeroSpeculation}
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/" className="hover:text-white transition">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/#marketplace" className="hover:text-white transition">
                  {t.nav.market}
                </Link>
              </li>
              <li>
                <Link href="/farmer" className="hover:text-white transition">
                  {t.nav.farmer}
                </Link>
              </li>
              <li>
                <Link href="/buyer" className="hover:text-white transition">
                  {t.nav.buyer}
                </Link>
              </li>
              <li>
                <Link href="/logistics" className="hover:text-white transition">
                  {t.nav.logistics}
                </Link>
              </li>
              <li>
                <Link href="/#architecture" className="hover:text-white transition">
                  {t.nav.warehouse}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition text-emerald-400 font-semibold">
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Pillars of Trust */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              {t.footer.trustPillars}
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/about#standards" className="hover:text-white transition">
                  {t.about.pillar1Title}
                </Link>
              </li>
              <li>
                <Link href="/about#standards" className="hover:text-white transition">
                  {t.about.pillar2Title}
                </Link>
              </li>
              <li>
                <Link href="/about#standards" className="hover:text-white transition">
                  {t.about.pillar3Title}
                </Link>
              </li>
              <li>
                <Link href="/about#standards" className="hover:text-white transition">
                  {t.about.pillar4Title}
                </Link>
              </li>
              <li>
                <Link href="/about#standards" className="hover:text-white transition">
                  {t.about.pillar5Title}
                </Link>
              </li>
            </ul>
          </div>

          {/* Regional Languages */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              {t.common.regionalLangSupport}
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code as LanguageCode)}
                  className={`text-left px-2 py-1.5 rounded text-[11px] transition border ${
                    language === l.code
                      ? 'bg-zinc-800 text-emerald-400 border-emerald-500/40 font-semibold'
                      : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal pt-1">
              {t.footer.legalNotice}
            </p>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-white transition">
              {t.footer.privacy}
            </Link>
            <Link href="/about" className="hover:text-white transition">
              {t.footer.terms}
            </Link>
            <Link href="/about" className="hover:text-white transition">
              {t.footer.security}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
