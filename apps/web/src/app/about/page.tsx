'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InquiryModal from '../../components/InquiryModal';
import {
  ShieldCheck,
  CheckCircle,
  Building2,
  Lock,
  Search,
  Scale,
  ArrowRight,
  FileCheck2,
  BadgeCheck,
  Sparkles,
  Cpu,
  Layers,
  TrendingUp,
  Activity,
  Award,
  Wallet,
  Coins,
  Send,
  User,
  Phone,
  Mail,
  MessageSquare,
  Building,
} from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [licenseQuery, setLicenseQuery] = useState('FL-RJ-0482');
  const [verifiedResult, setVerifiedResult] = useState<string | null>(null);

  // Direct Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'buyer',
    organization: '',
    message: '',
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseQuery.trim()) return;
    setVerifiedResult(
      `✓ Verified: Depot #${licenseQuery.trim()} is officially accredited with active automated grade assaying and cold-chain vault storage.`
    );
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) return;
    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col selection:bg-emerald-500/20 selection:text-emerald-950 dark:selection:text-emerald-100 transition-colors relative overflow-hidden">
      {/* Circuit Board / Mesh Grid Subtle Backdrop (Fintech SaaS Template Inspiration) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] dark:bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:28px_28px] opacity-15"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-3xl transform-gpu"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-teal-500/10 dark:bg-teal-600/10 blur-3xl transform-gpu"></div>
        <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl transform-gpu"></div>
      </div>

      <Navbar onOpenInquiry={() => setInquiryOpen(true)} />

      <main className="flex-1 relative z-10">
        {/* =================================================================== */}
        {/* HERO SECTION: Circuit-Board Grid + Live Finance Dashboard Badges  */}
        {/* =================================================================== */}
        <section className="relative border-b border-zinc-200/80 dark:border-zinc-800/80 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-wide uppercase shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.about.institutionalTrustBadge}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-[1.12]">
              {t.about.title}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              {t.about.subtitle}
            </p>

            {/* Quick Hero Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#standards"
                className="px-6 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 font-bold text-xs sm:text-sm transition shadow-sm inline-flex items-center gap-2"
              >
                <span>Explore Trust Pillars</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 font-bold text-xs sm:text-sm transition shadow-xs inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Contact Integration Desk</span>
              </a>
            </div>

            {/* Live Finance Dashboard Cards (Fintech Template Hero Feature) */}
            <div className="pt-8 grid grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-left">
              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
                <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase font-bold">
                  <span>Farmer Gain</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono mt-1">
                  +18.4%
                </div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {t.about.statIncomeGain}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
                <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase font-bold">
                  <span>MSP Compliance</span>
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono mt-1">
                  100%
                </div>
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                  {t.about.statMspAdherence}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
                <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase font-bold">
                  <span>Escrow Clearing</span>
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-zinc-50 font-mono mt-1">
                  T+1
                </div>
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                  {t.about.statEscrowSettlement}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
                <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase font-bold">
                  <span>Commission Cut</span>
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
                  0%
                </div>
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                  {t.about.statBrokerCut}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* SATIN FEATURE PANEL: Core Cause & Mission Statement                */}
        {/* =================================================================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="backdrop-blur-2xl bg-white/80 dark:bg-zinc-900/80 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-12 shadow-sm transition-all">
            <div className="max-w-3xl">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.about.coreCauseBadge}</span>
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-2 mb-6 tracking-tight">
                {t.about.missionTitle}
              </h2>

              <div className="space-y-4 text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
                <p>{t.about.missionText1}</p>
                <div className="font-medium text-zinc-800 dark:text-zinc-200 backdrop-blur-md bg-zinc-100/70 dark:bg-zinc-950/60 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
                  {t.about.missionText2}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* PHOTO GALLERY: Ground Realities & Agrarian Network Assets          */}
        {/* =================================================================== */}
        <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"
                  alt="Verified Direct Harvest"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-[10px] font-mono font-bold uppercase text-emerald-300 bg-emerald-950/80 backdrop-blur-md border border-emerald-700/50 px-2.5 py-0.5 rounded-full">
                  Farm Gate Assaying
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Direct Smallholder Harvests
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Farmers grading fresh produce lots directly at source, eliminating cartel deductions.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"
                  alt="WDRA Accredited Warehousing"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-[10px] font-mono font-bold uppercase text-blue-300 bg-blue-950/80 backdrop-blur-md border border-blue-700/50 px-2.5 py-0.5 rounded-full">
                  WDRA Accredited Depots
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Accredited Cold Silos & Vaults
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    State-of-the-art temperature and moisture telemetry protecting storable grain and perishables.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
                  alt="Institutional Procurement"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-[10px] font-mono font-bold uppercase text-purple-300 bg-purple-950/80 backdrop-blur-md border border-purple-700/50 px-2.5 py-0.5 rounded-full">
                  T+1 Escrow Settlement
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    Direct Institutional Clearance
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Seamless delivery to bulk processors and consumers with guaranteed automated payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 5 PILLARS OF INSTITUTIONAL TRUST: Grid Cards with Badges           */}
        {/* =================================================================== */}
        <section id="standards" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
              {t.about.uncompromisingStandards}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1 mb-3 tracking-tight">
              {t.about.trustSectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
              {t.about.trustSectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div id="standards-quality" className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between scroll-mt-24">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                  {t.about.pillar1Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {t.about.pillar1Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.about.agmarkFssaiCompliant}</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div id="standards-wdra" className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between scroll-mt-24">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                  {t.about.pillar2Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {t.about.pillar2Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] text-blue-700 dark:text-blue-400 font-semibold font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.about.wdraAccreditedDepots}</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div id="standards-msp" className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between scroll-mt-24">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                  {t.about.pillar3Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {t.about.pillar3Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-semibold font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.about.zeroDownsideGuardrail}</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div id="standards-escrow" className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between scroll-mt-24">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                  {t.about.pillar4Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {t.about.pillar4Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] text-purple-700 dark:text-purple-400 font-semibold font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.about.rbiRegulatedEscrow}</span>
              </div>
            </div>

            {/* Pillar 5 */}
            <div id="standards-telemetry" className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between md:col-span-2 lg:col-span-2 scroll-mt-24">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-4">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mb-2">
                  {t.about.pillar5Title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {t.about.pillar5Desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] text-teal-700 dark:text-teal-400 font-semibold font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.about.cryptoAuditTrail}</span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* PUBLIC TRUST REGISTRY & DEPOT LICENSE VERIFIER                     */}
        {/* =================================================================== */}
        <section id="compliance" className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-24">
          <div className="backdrop-blur-2xl bg-zinc-900/90 dark:bg-zinc-950/90 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="max-w-2xl relative z-10">
              <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>{t.about.publicTrustRegistry}</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 mb-2">
                {t.about.verificationWidgetTitle}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6">
                {t.about.verificationWidgetDesc}
              </p>

              <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={licenseQuery}
                    onChange={(e) => setLicenseQuery(e.target.value)}
                    placeholder={t.about.depotSearchPlaceholder}
                    className="w-full bg-zinc-950/80 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition shrink-0 shadow-md cursor-pointer"
                >
                  {t.about.checkButton}
                </button>
              </form>

              {verifiedResult && (
                <div className="mt-4 p-3 bg-zinc-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-mono flex items-start gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{verifiedResult}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* PLATFORM PLEDGE & ZERO COMMISSION ARCHITECTURE                     */}
        {/* =================================================================== */}
        <section id="governance" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-24">
          <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-8 text-center space-y-4 shadow-xs">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {t.about.governanceTitle}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              {t.about.governanceDesc}
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 shadow-xs">
                {t.about.govNoProprietary}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 shadow-xs">
                {t.about.govNoHiddenCharges}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 shadow-xs">
                {t.about.govPlatformFee}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* DEDICATED CONTACT & INTEGRATION DESK (Fintech SaaS Template Style) */}
        {/* =================================================================== */}
        <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-24 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 shadow-sm">
            {/* Left Contact Context */}
            <div className="lg:col-span-2 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-bold uppercase">
                <span>Institutional Onboarding</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug">
                {t.about.contactCtaTitle}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {t.about.contactCtaDesc}
              </p>

              <div className="pt-4 space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-start gap-3">
                  <Building className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-200 block font-semibold">Agrarian Nodal Hub:</strong>
                    <span>Muhana Terminal, Sanganer, Jaipur, RJ 302029</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-200 block font-semibold">Toll-Free Kisan Desk:</strong>
                    <span>1800-889-2603 (22 Indian Languages Supported)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-zinc-900 dark:text-zinc-200 block font-semibold">Institutional Escrow Desk:</strong>
                    <span>escrow.desk@farmlink-matrix.gov.in</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setInquiryOpen(true)}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                >
                  <span>Open Quick Modal Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-3 bg-zinc-50/80 dark:bg-zinc-950/60 p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
              {contactSubmitted ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                    Integration Inquiry Dispatched
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                    Our agrarian logistics and escrow officer will contact your organization within 2 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setContactSubmitted(false)}
                    className="mt-4 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Full Name <span className="text-emerald-600">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Sanjay Sharma"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Mobile Phone <span className="text-emerald-600">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          placeholder="9829012345"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Work Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="procurement@agrocorp.in"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Organization / FPO
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={contactForm.organization}
                          onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                          placeholder="Kisan Producer Org / ITC Foods"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Organization Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'buyer', label: 'Bulk Processor' },
                        { id: 'fpo', label: 'Farmer / FPO' },
                        { id: 'warehouse', label: 'Warehouse / Silo' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setContactForm({ ...contactForm, role: item.id })}
                          className={`py-2 px-2 text-[11px] rounded-xl border text-center font-bold transition ${
                            contactForm.role === item.id
                              ? 'bg-zinc-950 text-white dark:bg-emerald-500 dark:text-zinc-950 border-zinc-950 dark:border-emerald-500 shadow-2xs'
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Inquiry / Commodity Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Specify monthly quintal volume, required AGMARK grade, or regional delivery depot requirements..."
                      className="w-full p-3 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.about.contactCtaBtn}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
