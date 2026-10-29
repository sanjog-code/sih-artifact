'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage, LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { ShieldCheck, CheckCircle2, Lock, Scale, Sprout } from 'lucide-react';

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-background border-t border-border text-text-muted text-xs">
      {/* Top Banner: Institutional Standards */}
      <div className="border-b border-border bg-background-alt/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-text font-medium">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>{t.about?.certificationsTitle || 'Certifications & Standards'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              {t.about?.cert1 || 'AGMARK Grading'}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              {t.about?.cert2 || 'MSP Compliant'}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              {t.about?.cert3 || 'e-NWR Ready'}
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary" />
              {t.about?.cert4 || 'Data Secure'}
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
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-secondary tracking-tight">{t.nav?.brand || 'FarmLink'}</span>
            </div>
            <p className="text-text-muted leading-relaxed text-sm">
              {t.footer?.description || 'Direct agrarian network connecting farmers, warehouses, and buyers with explainable price intelligence.'}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-background border border-border">
                <Scale className="w-3 h-3 text-primary" />
                {t.common?.zeroSpeculation || 'Zero Speculation'}
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-text font-semibold uppercase tracking-wider text-[11px]">
              {t.footer?.quickLinks || 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition">{t.nav?.home || 'Overview'}</Link></li>
              <li><Link href="/#marketplace" className="hover:text-primary transition">{t.nav?.market || 'Live Market'}</Link></li>
              <li><Link href="/farmer" className="hover:text-primary transition">{t.nav?.farmer || 'Farmer Hub'}</Link></li>
              <li><Link href="/buyer" className="hover:text-primary transition">{t.nav?.buyer || 'Buyer Desk'}</Link></li>
              <li><Link href="/logistics" className="hover:text-primary transition">{t.nav?.logistics || 'Logistics Hub'}</Link></li>
              <li><Link href="/#architecture" className="hover:text-primary transition">{t.nav?.warehouse || 'Warehouse Ops'}</Link></li>
              <li><Link href="/about" className="hover:text-primary transition font-semibold text-primary">{t.nav?.about || 'About Us'}</Link></li>
            </ul>
          </div>

          {/* Pillars of Trust */}
          <div className="space-y-3">
            <h4 className="text-text font-semibold uppercase tracking-wider text-[11px]">
              {t.footer?.trustPillars || 'Trust Pillars'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about#standards" className="hover:text-primary transition">{t.about?.pillar1Title || 'Standardized Grading'}</Link></li>
              <li><Link href="/about#standards" className="hover:text-primary transition">{t.about?.pillar2Title || 'MSP Guaranteed'}</Link></li>
              <li><Link href="/about#standards" className="hover:text-primary transition">{t.about?.pillar3Title || 'Live Telemetry'}</Link></li>
              <li><Link href="/about#standards" className="hover:text-primary transition">{t.about?.pillar4Title || 'IVR Access'}</Link></li>
              <li><Link href="/about#standards" className="hover:text-primary transition">{t.about?.pillar5Title || 'Escrow Settlement'}</Link></li>
            </ul>
          </div>

          {/* Regional Languages */}
          <div className="space-y-3">
            <h4 className="text-text font-semibold uppercase tracking-wider text-[11px]">
              {t.common?.regionalLangSupport || 'Regional Languages'}
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code as LanguageCode)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition border ${
                    language === l.code
                      ? 'bg-primary text-white border-primary font-semibold'
                      : 'bg-background text-text-muted border-border hover:text-text hover:bg-background-alt'
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-text-light leading-normal pt-1">
              {t.footer?.legalNotice || 'FarmLink is a technology platform. Not a licensed mandi agent or broker.'}
            </p>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-muted">
          <p>© {new Date().getFullYear()} {t.footer?.copyright || 'FarmLink. All rights reserved.'}</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-primary transition">{t.footer?.privacy || 'Privacy'}</Link>
            <Link href="/about" className="hover:text-primary transition">{t.footer?.terms || 'Terms'}</Link>
            <Link href="/about" className="hover:text-primary transition">{t.footer?.security || 'Security'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}